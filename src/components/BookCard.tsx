import Link from "next/link";
import { Book, BookCardProps } from "@/types";
import { useCart } from "@/contexts/CartContext";

export default function BookCard({ book }: BookCardProps) {
  const { addItem, removeItem, isInCart } = useCart();
  const inCart = isInCart(book.isbn13);
  const usedList = book.subInfo?.usedList;

  const countOf = (info?: { itemCount: string }) =>
    info ? parseInt(info.itemCount || "0") || 0 : 0;

  const hasUsed =
    countOf(usedList?.aladinUsed) > 0 ||
    countOf(usedList?.userUsed) > 0 ||
    countOf(usedList?.spaceUsed) > 0;

  const formatPrice = (price: string) => {
    const num = parseInt(price) || 0;
    return num > 0 ? `${num.toLocaleString()}원` : "-";
  };

  const getDiscountPercent = () => {
    const standard = parseInt(book.priceStandard) || 0;
    const sales = parseInt(book.priceSales) || 0;
    if (standard === 0) return 0;
    return Math.round(((standard - sales) / standard) * 100);
  };

  const getLowestUsedPrice = () => {
    if (!usedList) return null;
    const prices: number[] = [];
    if (countOf(usedList.aladinUsed) > 0) {
      const p = parseInt(usedList.aladinUsed!.minPrice || "0") || 0;
      if (p > 0) prices.push(p);
    }
    if (countOf(usedList.userUsed) > 0) {
      const p = parseInt(usedList.userUsed!.minPrice || "0") || 0;
      if (p > 0) prices.push(p);
    }
    if (countOf(usedList.spaceUsed) > 0) {
      const p = parseInt(usedList.spaceUsed!.minPrice || "0") || 0;
      if (p > 0) prices.push(p);
    }
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  return (
    <Link
      href={`/book/${book.isbn13}`}
      className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow flex cursor-pointer"
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
          <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">{book.title}</h3>
          <p className="text-sm text-gray-600 mb-1">
            {book.author}
            {book.publisher && ` · ${book.publisher}`}
          </p>
          <p className="text-sm text-gray-500 mb-2">
            ISBN {book.isbn13}
            {book.pubDate && ` · ${book.pubDate.slice(0, 4)}.${book.pubDate.slice(4, 6)}.${book.pubDate.slice(6, 8)}`}
          </p>

          {/* 가격 */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {book.priceStandard && parseInt(book.priceStandard) > 0 && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(book.priceStandard)}
              </span>
            )}
            <span className="text-lg font-bold text-red-500">
              {formatPrice(book.priceSales)}
            </span>
            {/* 할인율 뱃지 */}
            {book.priceStandard &&
              book.priceSales &&
              parseInt(book.priceStandard) > 0 &&
              parseInt(book.priceSales) < parseInt(book.priceStandard) && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    getDiscountPercent() >= 50
                      ? "bg-green-100 text-green-700"
                      : getDiscountPercent() >= 30
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {getDiscountPercent()}%
                </span>
              )}
          </div>

          {/* 판매지수 & 평점 */}
          <div className="flex gap-3 text-xs text-gray-500">
            {book.salesPoint && (
              <span>🔥 판매지수 {parseInt(book.salesPoint).toLocaleString()}</span>
            )}
            {book.customerReviewRank && (
              <span>⭐ 평점 {book.customerReviewRank} / 10</span>
            )}
          </div>
        </div>

        {/* 중고 정보 */}
        {hasUsed && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {/* 중고 최저가 뱃지 */}
            {getLowestUsedPrice() !== null && (
              <div className="mb-2">
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                  🏷️ 중고 최저 <span className="underline">{formatPrice(getLowestUsedPrice()!.toString())}</span>
                </span>
              </div>
            )}
            <div className="flex flex-col gap-2 text-sm">
              {usedList?.aladinUsed &&
                parseInt(usedList.aladinUsed.itemCount) > 0 && (
                  <span className="text-blue-600">
                    📦 알라딘배송{" "}
                    <strong>{usedList.aladinUsed.itemCount}개</strong> · 최저{" "}
                    <strong>{formatPrice(usedList.aladinUsed.minPrice)}</strong>
                  </span>
                )}
              {usedList?.userUsed &&
                parseInt(usedList.userUsed.itemCount) > 0 && (
                  <span className="text-green-600">
                    👤 회원배송{" "}
                    <strong>{usedList.userUsed.itemCount}개</strong> · 최저{" "}
                    <strong>{formatPrice(usedList.userUsed.minPrice)}</strong>
                  </span>
                )}
              {usedList?.spaceUsed &&
                parseInt(usedList.spaceUsed.itemCount) > 0 && (
                  <span className="text-purple-600">
                    🏬 매장배송{" "}
                    <strong>{usedList.spaceUsed.itemCount}개</strong> · 최저{" "}
                    <strong>{formatPrice(usedList.spaceUsed.minPrice)}</strong>
                  </span>
                )}
            </div>
          </div>
        )}

        {!hasUsed && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">중고 정보 없음</span>
          </div>
        )}

        {/* 담기/빼기 버튼 */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            inCart ? removeItem(book.isbn13) : addItem(book);
          }}
          className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-colors ${
            inCart
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {inCart ? "🗑️ 담기 취소" : "🛒 장바구니 담기"}
        </button>
      </div>
    </Link>
  );
}
