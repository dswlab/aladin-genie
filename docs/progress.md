# 알라딘 제니 - 중고도서 검색 앱 진행 상황

## 프로젝트 개요
Next.js 15.5.20 + React 19 + TypeScript + Tailwind CSS로 구축하는 **중고도서 전용 검색 앱**
Aladin Open API (`http://www.aladin.co.kr/ttb/api/ItemSearch.aspx`)를 사용

---

## 구현 계획 (7단계)

### ✅ Step 1 — 타입 정의 확장 (완료)
**파일**: `src/types/index.ts`

추가한 내용:
- `SortOption` type: `Accuracy | PublishTime | SalesPoint | CustomerRating | PriceAsc | PriceDesc | DiscountDesc`
- `SortOptionInfo` interface
- `FilterState` interface: `priceRange: [number, number]`, `deliveryType: "all" | "aladin" | "user"`, `usedOnly: boolean`, `minDiscount: number`
- `DEFAULT_FILTER_STATE` 상수: `{ priceRange: [0, 100000], deliveryType: "all", usedOnly: false, minDiscount: 0 }`
- `SearchParams` interface에 `sort?: SortOption` 필드 추가

### ✅ Step 2 — API Route 수정 (완료)
**파일**: `src/app/api/search/route.ts`

수정 내용:
- `SERVER_SUPPORTED_SORTS` Set constant 추가 (`Accuracy`, `PublishTime`, `SalesPoint`, `CustomerRating`, `Title`, `MyReviewCount`)
- `mapSortToServer(sort)` helper 함수 추가 — 클라이언트 전용 sort 값 (PriceAsc/PriceDesc/DiscountDesc)은 API에 "Accuracy"로 전송
- `sort` query param을 request에서 받아 API에 전달
- 응답 body에 `requestedSort` 필드 포함 (클라이언트가 어떤 정렬을 요청했는지 추적용)

### ✅ Step 3 — FilterPanel 컴포넌트 생성 (완료)
**파일**: `src/components/FilterPanel.tsx`

구현 내용:
- **가격 범위**: min/max number input 필드
- **배송 유형**: 전체 / 알라딘배송 / 회원배송 (데스크탑: radio buttons, 모바일: pill buttons)
- **중고만 보기**: checkbox toggle
- **최소 할인율**: range slider (0% ~ 90%)
- 필터 초기화 버튼
- Responsive: 데스크탑 sticky sidebar / 모바일 컴팩트 필터 바

### ✅ Step 4 — SortBar 컴포넌트 생성 (완료)
**파일**: `src/components/SortBar.tsx`

구현 내용:
- 정렬 옵션 pill buttons: 정확도, 출간일, 판매평점, 고객평점, 가격낮은순, 가격높은순, 할인율높은순
- 선택된 옵션 하이라이트 (indigo bg) + 아이콘

### ✅ Step 5 — Main Page 필터링 로직 + 반응형 레이아웃 (완료)
**파일**: `src/app/page.tsx`

구현 내용:
- FilterPanel, SortBar 컴포넌트 통합
- `applyFiltersAndSort()` — 가격 범위, 배송 유형, 중고만 보기, 최소 할인율 필터 + PriceAsc/PriceDesc/DiscountDesc 정렬
- 페이지네이션 (pageSize=10)
- 반응형 레이아웃: 데스크탑 sidebar (lg:w-64) + content / 모바일 compact filter

### ✅ Step 6 — BookCard 할인율 뱃지 (완료)
**파일**: `src/components/BookCard.tsx`

구현 내용:
- 할인율 뱃지 (color-coded): 50%+ green, 30%+ orange, 그 외 gray
- 중고 최저가 뱃지 (amber bg)
- 알라딘배송 / 회원배송 개별 정보 표시
- 장바구니 담기/취소 버튼

### ⬜ Step 7 — 통합 테스트 & 반응형 검증
- 전체 flow 테스트: 검색 → 필터 적용 → 정렬 → 장바구니
- 반응형 레이아웃 검증 (mobile/desktop breakpoint)
- 에러 핸들링 & edge case 확인

---

##关键技术 결정

### API 제한 사항 & 대응 방안
| 제한 | 대응 |
|------|------|
| 가격 범위 필터 서버 미지원 | 클라이언트 사이드 필터링 |
| 중고 상태 필터 서버 미지원 | 클라이언트 사이드 필터링 |
| 배송 유형 필터 서버 미지원 | 클라이언트 사이드 필터링 |
| PriceAsc/PriceDesc/DiscountDesc 정렬 미지원 | API에는 "Accuracy" 보냄, 클라이언트에서 정렬 |
| 중고책 개별 목록 없음 (aggregate-only) | `itemCount`, `minPrice`, `link` aggregate 데이터로 작업 |

### 정렬 전략
- **Server-side 지원**: `Accuracy`, `PublishTime`, `SalesPoint`, `CustomerRating`, `Title`, `MyReviewCount` → API에 직접 전송
- **Client-side 전용**: `PriceAsc`, `PriceDesc`, `DiscountDesc` → API에는 "Accuracy" 전송 후 클라이언트에서 정렬

### 상태 관리
- **Cart**: `CartContext` (React Context API) + localStorage (`aladin-genie-cart`)
- **Filters**: `useState<FilterState>` in `page.tsx`
- **Sort**: `useState<SortOption>` in `page.tsx`

### 반응형
- Breakpoint: `lg:` (1024px) — 데스크탑 sidebar layout
- 모바일: 컴팩트 필터 바 (검색창 아래)

---

## 기존 파일 구조
```
src/
├── app/
│   ├── api/search/route.ts     ← Step 2 수정완료
│   ├── page.tsx                ← Step 5 수정 예정
│   ├── layout.tsx
│   ├── globals.css
│   └── cart/page.tsx
├── components/
│   ├── BookCard.tsx            ← Step 6 수정 예정
│   ├── SearchBar.tsx
│   ├── CartIcon.tsx
│   ├── FilterPanel.tsx         ← Step 3 생성 예정
│   └── SortBar.tsx             ← Step 4 생성 예정
├── contexts/
│   └── CartContext.tsx
└── types/
    └── index.ts                ← Step 1 수정완료
```

## 환경
- `ALADIN_API_KEY` 환경 변수는 `.env.local` 및 Vercel 대시보드에서 설정
- 배포: Vercel (master 브랜치 푸시 시 자동 빌드)
