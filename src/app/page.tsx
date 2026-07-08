"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import BookCard from "@/components/BookCard";

type QueryType = "Keyword" | "Title" | "Author" | "Publisher";

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

export default function Home() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>("");

  const handleSearch = async (query: string, queryType: QueryType) => {
    setIsLoading(true);
    setError(null);
    setLastQuery(query);

    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(query)}&queryType=${queryType}&maxResults=10`
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "검색 중 오류가 발생했습니다.");
      }

      const data = await response.json();
      setBooks(data.item || []);
      setTotalResults(parseInt(data.totalResults) || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      setBooks([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 검색창 */}
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {/* 결과 */}
      {books.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">
              &apos;<strong>{lastQuery}</strong>&apos; 검색 결과{" "}
              <span className="font-bold text-red-500">{totalResults}</span>건
            </p>
          </div>

          <div className="space-y-4">
            {books.map((book, index) => (
              <BookCard key={book.isbn13 || index} book={book} />
            ))}
          </div>

          {/* 더보기 안내 */}
          {totalResults > books.length && (
            <p className="text-center text-gray-400 text-sm mt-6">
              ...총 {totalResults}건 중 {books.length}건 표시 (더보기 기능 준비 중)
            </p>
          )}
        </div>
      )}

      {/* 초기 상태 */}
      {books.length === 0 && !isLoading && !error && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-lg">원하는 책을 검색해보세요!</p>
          <p className="text-sm mt-2">
            제목, 저자, ISBN으로 중고 도서를 찾아드립니다
          </p>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="text-center py-20">
          <div className="inline-block animate-spin text-4xl">🔍</div>
          <p className="text-gray-500 mt-4">검색 중...</p>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-500">{error}</p>
        </div>
      )}
    </>
  );
}
