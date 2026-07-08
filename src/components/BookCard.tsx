interface BookItem {
  title: string;
  author: string;
  publisher: string;
  pubDate: string;
  isbn13: string;
  priceSales: string;
  priceStandard: string;
  cover: string;
  link: string;
  description: string;
  salesPoint: string;
  customerReviewRank: string;
  subInfo?: {
    usedList?: {
      aladinUsed?: {
        itemCount: string;
        minPrice: string;
        link: string;
      };
      userUsed?: {
        itemCount: string;
        minPrice: string;
        link: string;
      };
    };
  };
}

interface BookCardProps {
  book: BookItem;
}

export default function BookCard({ book }: BookCardProps) {
  const usedList = book.subInfo?.usedList;
  const hasUsed =
    (usedList?.aladinUsed && parseInt(usedList.aladinUsed.itemCount) > 0) ||
    (usedList?.userUsed && parseInt(usedList.userUsed.itemCount) > 0);

  const formatPrice = (price: string) => {
    const num = parseInt(price) || 0;
    return num > 0 ? `${num.toLocaleString()}원` : "-";
  };

  return (
    <a
      href={book.link}
      target="_blank"
      rel="noopener noreferrer"
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
            <div className="flex gap-3 text-sm">
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
            </div>
          </div>
        )}

        {!hasUsed && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">중고 정보 없음</span>
          </div>
        )}
      </div>
    </a>
  );
}
