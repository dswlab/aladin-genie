---
name: api-decisions
description: 알라딘 API 제한 사항과 클라이언트 사이드 필터링/정렬 архитектур 결정
metadata: 
  node_type: memory
  type: project
  originSessionId: 67a58dd2-8dd7-48b5-bb19-7dedb4a60b27
---

알라딘 API (`http://www.aladin.co.kr/ttb/api/ItemSearch.aspx`) 제한 사항:
- 가격 범위 필터, 중고 상태 필터, 배송 유형 필터 → 서버사이드 미지원
- PriceAsc / PriceDesc / DiscountDesc 정렬 → 서버사이드 미지원
- 중고책 개별 목록 없음 → aggregate-only (`itemCount`, `minPrice`, `link`)

대응 방안:
- 가격/상태/배송 필터 → **클라이언트 사이드 필터링** (API 응답 후 JS로 필터)
- 가격/할인 정렬 → API에는 "Accuracy" 전송, **클라이언트 사이드 정렬**
- 서버 지원 정렬: `Accuracy`, `PublishTime`, `SalesPoint`, `CustomerRating`, `Title`, `MyReviewCount`
- `mapSortToServer()` 함수가 클라이언트 전용 sort를 "Accuracy"로 매핑

**Why:** API가 중고도서 필터링을 서버사이드에서 지원하지 않음. 클라이언트에서 처리해야 함.
**How to apply:** 필터/정렬 로직을 `page.tsx`에서 구현. API 호출 시 `OptResult=usedList` 필수.

[[project-goal]]
