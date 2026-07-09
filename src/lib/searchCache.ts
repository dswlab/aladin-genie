import type { Book, FilterState, SortOption } from "@/types";

/**
 * 검색 세션을 메모리에 캐싱하여 뒤로가기/앞으로가기 시
 * API 재호출 없이 즉시 복원하기 위한 가벼운 모듈.
 *
 * 모듈 수준 Map은 클라이언트 내비게이션 중에 유지되므로
 * Provider나 Context 없이도 뒤로가기 복원이 가능하다.
 * 단, 새로고침(F5) 시에는 초기화되어 URL 기반 재검색으로 폴백한다.
 */

export interface CachedSearch {
  books: Book[];
  totalResults: number;
  currentPage: number;
  filterState: FilterState;
  selectedSort: SortOption;
  scrollY: number;
}

// 캐시 키 생성: 검색어/유형/정렬 조합
export function makeCacheKey(
  query: string,
  queryType: string,
  sort: string
): string {
  return `${query}|${queryType}|${sort}`;
}

const cache = new Map<string, CachedSearch>();

// 오래된 캐시가 무한정 쌓이지 않도록 상한선 설정
const MAX_CACHE_SIZE = 10;

function pruneIfNeeded() {
  if (cache.size > MAX_CACHE_SIZE) {
    // 가장 오래된 항목(첫 번째) 삭제
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
}

export const searchCache = {
  get(key: string): CachedSearch | undefined {
    return cache.get(key);
  },

  /** scrollY를 제외한 검색 상태를 병합 저장 (기존 scrollY 유지) */
  set(
    key: string,
    data: Omit<CachedSearch, "scrollY">,
    scrollY?: number
  ): void {
    const existing = cache.get(key);
    cache.set(key, {
      ...data,
      scrollY: scrollY ?? existing?.scrollY ?? 0,
    });
    pruneIfNeeded();
  },

  /** 스크롤 위치만 별도 갱신 (스크롤 리스너에서 빈번하게 호출) */
  setScrollY(key: string, scrollY: number): void {
    const existing = cache.get(key);
    if (existing) {
      existing.scrollY = scrollY;
    }
  },

  clear(key?: string): void {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  },
};
