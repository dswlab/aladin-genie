"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { items, removeItem, clearCart, itemCount } = useCart();

  const formatPrice = (price: string) => {
    const num = parseInt(price) || 0;
    return num > 0 ? `${num.toLocaleString()}원` : "-";
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-xl text-gray-500 mb-2">장바구니가 비어있습니다</p>
        <p className="text-sm text-gray-400">원하는 책을 검색해서 담아보세요!</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            ← 홈으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            🛒 장바구니 <span className="text-red-500">({itemCount})</span>
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          전체 비우기
        </button>
      </div>

      <div className="space-y-4">
        {items.map((cartItem) => {
          const { book } = cartItem;
          return (
            <div
              key={cartItem.id}
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow flex"
            >
              {/* 표지 이미지 */}
              <div className="w-36 flex-shrink-0 bg-gray-50 flex items-center justify-center p-2">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="max-h-40 object-contain"
                />
              </div>

              {/* 정보 */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {book.author}
                    {book.publisher && ` · ${book.publisher}`}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    ISBN {book.isbn13}
                  </p>

                  {/* 가격 */}
                  <div className="flex items-baseline gap-2 mb-2">
                    {book.priceStandard && parseInt(book.priceStandard) > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(book.priceStandard)}
                      </span>
                    )}
                    <span className="text-lg font-bold text-red-500">
                      {formatPrice(book.priceSales)}
                    </span>
                  </div>

                  {/* 판매지수 & 평점 */}
                  <div className="flex gap-3 text-xs text-gray-500">
                    {book.salesPoint && (
                      <span>
                        🔥 판매지수 {parseInt(book.salesPoint).toLocaleString()}
                      </span>
                    )}
                    {book.customerReviewRank && (
                      <span>⭐ 평점 {book.customerReviewRank} / 10</span>
                    )}
                  </div>
                </div>

                {/* 중고 정보 */}
                {book.subInfo?.usedList && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex gap-3 text-sm">
                      {book.subInfo.usedList.aladinUsed &&
                        parseInt(book.subInfo.usedList.aladinUsed.itemCount) >
                          0 && (
                          <span className="text-blue-600">
                            📦 알라딘배송{" "}
                            <strong>
                              {book.subInfo.usedList.aladinUsed.itemCount}개
                            </strong>{" "}
                            · 최저{" "}
                            <strong>
                              {formatPrice(
                                book.subInfo.usedList.aladinUsed.minPrice
                              )}
                            </strong>
                          </span>
                        )}
                      {book.subInfo.usedList.userUsed &&
                        parseInt(book.subInfo.usedList.userUsed.itemCount) >
                          0 && (
                          <span className="text-green-600">
                            👤 회원배송{" "}
                            <strong>
                              {book.subInfo.usedList.userUsed.itemCount}개
                            </strong>{" "}
                            · 최저{" "}
                            <strong>
                              {formatPrice(
                                book.subInfo.usedList.userUsed.minPrice
                              )}
                            </strong>
                          </span>
                        )}
                    </div>
                  </div>
                )}

                {/*Actions */}
                <div className="flex gap-2 mt-3">
                  <a
                    href={book.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    📖 상세 보기
                  </a>
                  <button
                    type="button"
                    onClick={() => removeItem(book.isbn13)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    🗑️ 제거
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 요약 섹션 */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">📝 구매 요약</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">담겨 있는 도서</span>
            <span className="font-medium">{itemCount}권</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <p className="text-gray-500 text-xs">
              💡 같은 판매자의 도서를 함께 주문하면 배송비를 절약할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
