"use client";

import { useState, useEffect, useCallback, useLayoutEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import BookCard from "@/components/BookCard";
import FilterPanel from "@/components/FilterPanel";
import SortBar from "@/components/SortBar";
import { Book, QueryType, FilterState, DEFAULT_FILTER_STATE, SortOption } from "@/types";
import { searchCache, makeCacheKey } from "@/lib/searchCache";

function HomeContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL에서 검색 상태 읽기
  const urlQuery = searchParams.get("query") || "";
  const urlQueryType = (searchParams.get("queryType") || "Keyword") as QueryType;
  const urlSort = (searchParams.get("sort") || "Accuracy") as SortOption;

  // 캐시 키 생성 (뒤로가기 시 메모리에서 즉시 복원하기 위함)
  const cacheKey = makeCacheKey(urlQuery, urlQueryType, urlSort);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cached = urlQuery ? searchCache.get(cacheKey) : undefined;

  // 캐시 기반 lazy 초기화: 뒤로가기 시 깜빡임 없이 즉시 복원
  const [books, setBooks] = useState<Book[]>(() => cached?.books ?? []);
  const [totalResults, setTotalResults] = useState<number>(() => cached?.totalResults ?? 0);
  const [currentPage, setCurrentPage] = useState<number>(() => cached?.currentPage ?? 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<FilterState>(() => cached?.filterState ?? { ...DEFAULT_FILTER_STATE });
  const [selectedSort, setSelectedSort] = useState<SortOption>(() => cached?.selectedSort ?? urlSort);
  const apiBatchSize = 50;
  const pageSize = 10;

  // 검색 실행 함수
  const fetchResults = useCallback(async (query: string, queryType: QueryType, sort: SortOption) => {
    if (!query) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(query)}&queryType=${queryType}&maxResults=${apiBatchSize}&page=1&sort=${sort}`
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "검색 중 오류가 발생했습니다.");
      }

      const data = await response.json();
      setBooks(data.item || []);
      setTotalResults(parseInt(data.totalResults) || 0);
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      setBooks([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // URL 파라미터가 바뀌면 자동으로 재검색 (단, 캐시 히트 시 API 호출 생략)
  useEffect(() => {
    if (!urlQuery) return;
    setSelectedSort(urlSort);
    const cachedEntry = searchCache.get(cacheKey);
    if (!cachedEntry) {
      // 캐시 미스(최초 검색 또는 새로고침)인 경우에만 API 호출
      fetchResults(urlQuery, urlQueryType, urlSort);
    }
  }, [urlQuery, urlQueryType, urlSort, cacheKey, fetchResults]);

  // 검색 상태가 변할 때마다 캐시에 자동 저장 (뒤로가기 복원용)
  useEffect(() => {
    if (!urlQuery || books.length === 0) return;
    searchCache.set(cacheKey, {
      books,
      totalResults,
      currentPage,
      filterState,
      selectedSort,
    });
  }, [books, totalResults, currentPage, filterState, selectedSort, cacheKey, urlQuery]);

  // 스크롤 위치 저장: 스크롤 시 + 언마운트(상세 페이지 이동) 시 최종 위치 저장
  useEffect(() => {
    if (!urlQuery) return;
    const handler = () => searchCache.setScrollY(cacheKey, window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => {
      handler(); // 언마운트 시 최종 위치 저장
      window.removeEventListener("scroll", handler);
    };
  }, [urlQuery, cacheKey]);

  // 스크롤 위치 복원: 캐시에서 복원된 경우 한 번만 스크롤 이동
  useLayoutEffect(() => {
    if (cached?.scrollY && cached.scrollY > 0) {
      window.scrollTo(0, cached.scrollY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 검색 실행 → URL 업데이트 (히스토리에 기록되어 뒤로가기 가능)
  const handleSearch = (query: string, queryType: QueryType) => {
    const params = new URLSearchParams();
    params.set("query", query);
    params.set("queryType", queryType);
    params.set("sort", selectedSort);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (sort: SortOption) => {
    setSelectedSort(sort);
    if (urlQuery) {
      const params = new URLSearchParams(searchParams);
      params.set("sort", sort);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  // 페이지 이동: 페이지 변경 후 결과 목록 상단으로 스크롤
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* --- Client-side filter & sort helpers --- */

  const getDiscount = (book: Book): number => {
    const standard = parseInt(book.priceStandard) || 0;
    const sale = parseInt(book.priceSales) || standard;
    if (standard === 0) return 0;
    return Math.round(((standard - sale) / standard) * 100);
  };

  // 중고 최저가 계산 (알라딘/회원/매장 중 보유한 것의 최저가)
  const getLowestUsedPrice = (book: Book): number | null => {
    const usedList = book.subInfo?.usedList;
    if (!usedList) return null;
    const prices: number[] = [];
    for (const key of ["aladinUsed", "userUsed", "spaceUsed"] as const) {
      const info = usedList[key];
      if (info && parseInt(info.itemCount || "0") > 0) {
        const p = parseInt(info.minPrice || "0") || 0;
        if (p > 0) prices.push(p);
      }
    }
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  // 가격 기준에 따른 대표 가격
  const getBookPriceForFilter = (book: Book): number => {
    const salePrice = parseInt(book.priceSales || book.priceStandard || "0") || 0;
    const usedPrice = getLowestUsedPrice(book);

    switch (filterState.priceBasis) {
      case "sale":
        return salePrice;
      case "lowestUsed":
        return usedPrice ?? Infinity; // 중고가 없으면 필터에서 제외
      case "any":
      default:
        // 판매가 또는 중고가 중 범위에 들어오면 통과시키기 위해 최소값 사용
        return usedPrice !== null ? Math.min(salePrice, usedPrice) : salePrice;
    }
  };

  const hasUsed = (book: Book): boolean => {
    const usedList = book.subInfo?.usedList;
    if (!usedList) return false;
    const aladinCount = parseInt(usedList.aladinUsed?.itemCount || "0") || 0;
    const userCount = parseInt(usedList.userUsed?.itemCount || "0") || 0;
    const spaceCount = parseInt(usedList.spaceUsed?.itemCount || "0") || 0;
    return (aladinCount + userCount + spaceCount) > 0;
  };

  const applyFiltersAndSort = (bookList: Book[]): Book[] => {
    let result = [...bookList];

    // Price range
    result = result.filter((book) => {
      const price = getBookPriceForFilter(book);
      return price !== Infinity && price >= filterState.priceRange[0] && price <= filterState.priceRange[1];
    });

    // Used only
    if (filterState.usedOnly) {
      result = result.filter(hasUsed);
    }

    // Delivery type
    if (filterState.deliveryType !== "all") {
      const typeKey = {
        aladin: "aladinUsed",
        user: "userUsed",
        space: "spaceUsed",
      }[filterState.deliveryType] as "aladinUsed" | "userUsed" | "spaceUsed";
      result = result.filter((book) => {
        const count = parseInt(book.subInfo?.usedList?.[typeKey]?.itemCount || "0") || 0;
        return count > 0;
      });
    }

    // Min discount
    if (filterState.minDiscount > 0) {
      result = result.filter((book) => getDiscount(book) >= filterState.minDiscount);
    }

    // Client-side sorting
    const bookPrice = (b: Book) => parseInt(b.priceSales || b.priceStandard || "0") || 0;
    if (selectedSort === "PriceAsc") {
      result.sort((a, b) => bookPrice(a) - bookPrice(b));
    } else if (selectedSort === "PriceDesc") {
      result.sort((a, b) => bookPrice(b) - bookPrice(a));
    } else if (selectedSort === "DiscountDesc") {
      result.sort((a, b) => getDiscount(b) - getDiscount(a));
    }

    return result;
  };

  const filteredBooks = applyFiltersAndSort(books);
  const totalPages = Math.ceil(filteredBooks.length / pageSize);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      {/* 검색창 */}
      <div className="mb-6">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {/* 필터 + 결과 레이아웃 */}
      {books.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:gap-8">
          {/* 모바일 컴팩트 필터 */}
          <div className="lg:hidden mb-4">
            <FilterPanel filterState={filterState} onFilterChange={setFilterState} />
          </div>

          {/* 데스크탑 사이드바 */}
          <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
            <FilterPanel filterState={filterState} onFilterChange={setFilterState} />
          </div>

          {/* 결과 영역 */}
          <div className="flex-1 min-w-0">
            {/* 정렬 바 */}
            <div className="mb-4">
              <SortBar selectedSort={selectedSort} onSortChange={handleSortChange} />
            </div>

            {/* 결과 수 */}
            <div className="mb-4">
              <p className="text-gray-600 text-sm">
                &apos;<strong>{urlQuery}</strong>&apos; 검색{" "}
                <span className="font-bold text-red-500">{totalResults}</span>건
                {filteredBooks.length !== books.length && (
                  <span>
                    {" "} 필터{" "}
                    <span className="font-bold text-indigo-600">{filteredBooks.length}</span>건
                  </span>
                )}
              </p>
            </div>

            {/* 책 목록 */}
            <div className="space-y-4">
              {paginatedBooks.map((book, index) => (
                <BookCard key={book.isbn13 || index} book={book} />
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  ← 이전
                </button>

                <span className="text-sm text-gray-500 px-2">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  다음 →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 필터링 후 없음 */}
      {books.length > 0 && filteredBooks.length === 0 && !isLoading && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg">필터에 맞는 책이 없습니다.</p>
          <p className="text-sm mt-2">필터 조건을 완화해보세요.</p>
        </div>
      )}

      {/* 초기 상태 */}
      {books.length === 0 && !isLoading && !error && !urlQuery && (
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

export default function Home() {
  return (
    <Suspense fallback={
      <div className="text-center py-20">
        <div className="inline-block animate-spin text-4xl">🔍</div>
        <p className="text-gray-500 mt-4">불러오는 중...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
