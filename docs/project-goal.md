---
name: project-goal
description: 알라딘 제니 - 중고도서 전용 검색 앱 프로젝트 목표 및 기술 스택
metadata: 
  node_type: memory
  type: project
  originSessionId: 67a58dd2-8dd7-48b5-bb19-7dedb4a60b27
---

프로젝트 목표: 알라딘 Open API를 사용하는 **중고도서 전용 검색 앱** 구축.

기술 스택: Next.js 15.5.20, React 19, TypeScript (strict mode), Tailwind CSS 3.4.17, React Context API.

기능: 책 검색, 중고도서 필터링(가격 범위, 배송 유형, 할인율), 정렬(가격 순, 할인율 순), 장바구니.

반응형 레이아웃: 데스크탑에서는 sidebar 필터 패널, 모바일에서는 컴팩트 필터 바.

**Why:** 사용자는 중고도서만 검색하는 전용 앱을 원함. 일반 검색이 아닌 중고도서 특화 기능 필요.
**How to apply:** 모든新功能 설계 시 중고도서 중심적으로 구현. API는 `OptResult=usedList`로 중고 정보 포함.
