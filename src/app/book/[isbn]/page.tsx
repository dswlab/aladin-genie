"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import UsedSellerCard from "@/components/UsedSellerCard";

interface BookDetail {
  title: string;
  author: string;
  publisher: string;
  pubDate: string;
  description: string;
  isbn13: string;
  priceSales: string;
  priceStandard: string;
  cover: string;
  link: string;
  salesPoint: string;
  customerReviewRank: string;
  categoryName: string;
  subInfo?: {
    subTitle?: string;
    originalTitle?: string;
    itemPage?: string;
    usedList?: {
      aladinUsed?: { itemCount: number; minPrice: number; link: string };
      userUsed?: { itemCount: number; minPrice: number; link: string };
      spaceUsed?: { itemCount: number; minPrice: number; link: string };
    };
  };
}

interface OffStore {
  offCode: string;
  offName: string;
  link: string;
}

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ isbn: string }>;
}) {
  const { isbn } = use(params);
  const [book, setBook] = useState<BookDetail | null>(null);
  const [stores, setStores] = useState<OffStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 도서 상세 정보 + 중고 정보
        const bookRes = await fetch(`/api/book/${isbn}`);
        if (!bookRes.ok) {
          const err = await bookRes.json();
          throw new Error(err.error || "도서 정보를 불러오지 못했습니다.");
        }
        const bookData = await bookRes.json();
        setBook(bookData);

        // 중고 보유 매장 목록 (실패해도 페이지는 표시)
        try {
          const storesRes = await fetch(`/api/used-stores?isbn=${isbn}`);
          if (storesRes.ok) {
            const storesData = await storesRes.json();
            setStores(storesData.stores || []);
          }
        } catch {
          // 매장 목록은 부가 정보이므로 무시
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isbn]);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin text-4xl">📖</div>
        <p className="text-gray-500 mt-4">도서 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-red-500">{error || "도서를 찾을 수 없습니다."}</p>
        <Link
          href="/"
          className="inline-block mt-4 text-blue-500 hover:underline"
        >
          ← 검색 페이지로
        </Link>
      </div>
    );
  }

  const usedList = book.subInfo?.usedList;
  const sellers = [
    usedList?.aladinUsed && {
      type: "aladinUsed" as const,
      ...usedList.aladinUsed,
    },
    usedList?.userUsed && {
      type: "userUsed" as const,
      ...usedList.userUsed,
    },
    usedList?.spaceUsed && {
      type: "spaceUsed" as const,
      ...usedList.spaceUsed,
    },
  ].filter(
    (s): s is NonNullable<typeof s> => s !== null && s !== undefined && s.itemCount > 0
  );

  const formatDate = (d: string) => {
    if (!d || d.length < 8) return "";
    return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}`;
  };

  return (
    <div>
      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        ← 검색 결과로
      </button>

      {/* 도서 정보 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8 flex gap-6">
        <div className="w-48 flex-shrink-0">
          <img
            src={book.cover}
            alt={book.title}
            className="w-full object-contain"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{book.title}</h1>
          {book.subInfo?.subTitle && (
            <p className="text-gray-500 mb-3">{book.subInfo.subTitle}</p>
          )}
          <div className="space-y-1 text-gray-600 mb-4">
            <p>
              {book.author}
              {book.publisher && ` · ${book.publisher}`}
            </p>
            <p className="text-sm">
              {formatDate(book.pubDate)}
              {book.subInfo?.itemPage &&
                ` · ${book.subInfo.itemPage}쪽`}
              {book.categoryName && ` · ${book.categoryName}`}
            </p>
            <p className="text-sm text-gray-400">ISBN {book.isbn13}</p>
          </div>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-bold text-red-500">
              {parseInt(book.priceSales || "0").toLocaleString()}원
            </span>
            {parseInt(book.priceStandard || "0") > 0 && (
              <span className="text-gray-400 line-through">
                {parseInt(book.priceStandard).toLocaleString()}원
              </span>
            )}
          </div>

          {book.description && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
              {book.description}
            </p>
          )}
        </div>
      </div>

      {/* 중고 도서 셀러 비교 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          📦 중고 도서 셀러 비교
        </h2>

        {sellers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sellers.map((seller) => (
              <UsedSellerCard key={seller.type} {...seller} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
            현재 등록된 중고 상품이 없습니다.
          </div>
        )}
      </div>

      {/* 중고 보유 매장 목록 */}
      {stores.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            🏬 중고 보유 매장 ({stores.length}개)
          </h2>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <div className="flex flex-wrap gap-2">
              {stores.map((store) => (
                <a
                  key={store.offCode}
                  href={store.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  {store.offName}
                </a>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              ※ 매장별 재고 및 가격은 알라딘 매장 페이지에서 확인하세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
