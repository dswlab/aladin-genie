// ============================================================
// 알라딘 제니 - 핵심 타입 정의
// ============================================================

// --- 알라딘 API 응답 구조 ---

/** 중고 판매 정보 (알라딘 배송 / 회원 배송 공통) */
export interface UsedInfo {
  itemCount: string;
  minPrice: string;
  link: string;
}

/** 중고 목록 정보 */
export interface UsedList {
  aladinUsed?: UsedInfo;
  userUsed?: UsedInfo;
  spaceUsed?: UsedInfo;
}

/** 서브 정보 */
export interface BookSubInfo {
  usedList?: UsedList;
}

/** 책 정보 (알라딘 API 응답 기반) */
export interface Book {
  title: string;
  author: string;
  publisher: string;
  pubDate: string;
  isbn13: string;
  isbn10: string;
  priceSales: string;
  priceStandard: string;
  cover: string;
  link: string;
  description: string;
  salesPoint: string;
  customerReviewRank: string;
  subInfo?: BookSubInfo;
}

/** 알라딘 API 검색 응답 */
export interface AladinSearchResponse {
  item: Book[];
  totalResults: string;
  startIndex: string;
  endIndex: string;
}

// --- 검색 관련 ---

export type QueryType = "Keyword" | "Title" | "Author" | "Publisher";

// --- 정렬 옵션 ---

/** 정렬 옵션 (서버 지원 + 클라이언트 전용) */
export type SortOption =
  | "Accuracy"
  | "PublishTime"
  | "SalesPoint"
  | "CustomerRating"
  | "PriceAsc"
  | "PriceDesc"
  | "DiscountDesc";

/** 정렬 옵션 표시 정보 */
export interface SortOptionInfo {
  value: SortOption;
  label: string;
  serverSupported: boolean; // 서버사이드에서 지원하는 정렬인지
}

// --- 필터 상태 ---

/** 가격 필터 기준이 되는 가격 종류 */
export type PriceBasis = "sale" | "lowestUsed" | "any";

/**
 * 클라이언트사이드 필터 상태
 * Aladin API는 가격/중고 여부/배송 종류 필터를 서버사이드에서 지원하지 않으므로
 * 검색 결과에 대해 클라이언트에서 필터링을 적용한다.
 */
export interface FilterState {
  priceRange: [number, number]; // 최소 ~ 최대 가격
  priceBasis: PriceBasis; // 가격 기준 (판매가 / 중고 최저가 / 둘 다)
  deliveryType: "all" | "aladin" | "user" | "space"; // 배송 유형
  usedOnly: boolean; // 중고 재고 있는 책만 보기
  minDiscount: number; // 최소 할인율 (%)
}

/** 기본 필터 값 */
export const DEFAULT_FILTER_STATE: FilterState = {
  priceRange: [0, 100000],
  priceBasis: "any",
  deliveryType: "all",
  usedOnly: false,
  minDiscount: 0,
};

export interface SearchParams {
  query: string;
  queryType: QueryType;
  page: number;
  maxResults: number;
  sort?: SortOption;
}

export interface SearchState {
  books: Book[];
  totalResults: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  lastQuery: string;
  lastQueryType: QueryType;
}

// --- 셀러 관련 ---

/** 셀러 정보 */
export interface Seller {
  sellerName: string;
  sellerCode: string;
  sellerRating: number; // 0 ~ 100
  sellerGrade: string; // A, B, C, D
  shippingFee: number; // 예상 배송비
  itemCount: number; // 장바구니 내 셀러 도서 수
}

// --- 장바구니 관련 ---

/** 장바구니 아이템 */
export interface CartItem {
  id: string; // 고유 ID (isbn13 + timestamp 등)
  book: Book;
  selectedAt: number; // 담김 시간 (timestamp)
  sellerInfo?: {
    sellerName: string;
    sellerGrade: string;
    price: number;
    shippingFee: number;
  };
}

// --- 셀러 매칭 분석 결과 ---

/** 셀러별 그룹화된 결과 */
export interface SellerGroup {
  seller: Seller;
  items: CartItem[];
  totalPrice: number;
  totalShippingFee: number;
  estimatedSavings: number; // 개별 구매 대비 절감액
}

/** 매칭 분석 결과 */
export interface MatchResult {
  groups: SellerGroup[];
  unmatchedItems: CartItem[]; // 매칭 실패 아이템
  individualTotal: number; // 개별 구매 총 비용
  optimizedTotal: number; // 최적화 후 총 비용
  savingsPercent: number; // 절감 비율(%)
}

// --- 컴포넌트 Props ---

export interface SearchBarProps {
  onSearch: (query: string, queryType: QueryType) => void;
  isLoading: boolean;
}

export interface BookCardProps {
  book: Book;
  onAddToCart?: (book: Book) => void;
  isInCart?: boolean;
}
