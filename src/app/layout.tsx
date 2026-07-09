import type { Metadata } from "next";
import Link from "next/link";
import { CartProvider } from "@/contexts/CartContext";
import CartIcon from "@/components/CartIcon";
import "./globals.css";

export const metadata: Metadata = {
  title: "알라딘 중고 도서 구매 도우미",
  description: "알라딘 중고 도서를 검색하고 최적의 구매 경로를 찾아드립니다",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <CartProvider>
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://image.aladin.co.kr/img/logo_big.jpg"
                alt="알라딘 로고"
                className="h-10"
              />
              <span className="text-lg font-semibold text-gray-700">
                중고 도서 구매 도우미
              </span>
            </div>
            <CartIcon />
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="text-center text-gray-400 text-sm py-6">
          © {new Date().getFullYear()} Aladin Genie · 알라딘 Open API 기반
        </footer>
        </CartProvider>
      </body>
    </html>
  );
}
