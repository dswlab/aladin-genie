"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Book, CartItem } from "@/types";

// --- localStorage key ---
const CART_STORAGE_KEY = "aladin-genie-cart";

// --- Helper: read cart from localStorage ---
function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// --- Helper: save cart to localStorage ---
function saveCartToStorage(cart: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // silently ignore (quota exceeded, etc.)
  }
}

// --- Context shape ---
interface CartContextType {
  items: CartItem[];
  addItem: (book: Book) => void;
  removeItem: (isbn13: string) => void;
  clearCart: () => void;
  isInCart: (isbn13: string) => boolean;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// --- Provider ---
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Initialize from localStorage on mount
  useEffect(() => {
    setItems(loadCartFromStorage());
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addItem = useCallback(
    (book: Book) => {
      setItems((prev) => {
        // Avoid duplicates: check by isbn13
        if (prev.some((item) => item.book.isbn13 === book.isbn13)) {
          return prev;
        }
        return [
          ...prev,
          {
            id: `${book.isbn13}-${Date.now()}`,
            book,
            selectedAt: Date.now(),
          },
        ];
      });
    },
    [],
  );

  const removeItem = useCallback((isbn13: string) => {
    setItems((prev) => prev.filter((item) => item.book.isbn13 !== isbn13));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (isbn13: string) => items.some((item) => item.book.isbn13 === isbn13),
    [items],
  );

  const contextValue = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      clearCart,
      isInCart,
      itemCount: items.length,
    }),
    [items, addItem, removeItem, clearCart, isInCart],
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

// --- Hook ---
export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
