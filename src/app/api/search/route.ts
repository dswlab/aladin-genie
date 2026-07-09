import { NextRequest, NextResponse } from "next/server";

const ALADIN_API_KEY = process.env.ALADIN_API_KEY!;
const ALADIN_API_BASE = "https://www.aladin.co.kr/ttb/api/ItemSearch.aspx";

/** API에서 지원하는 정렬 옵션 */
const SERVER_SUPPORTED_SORTS = new Set([
  "Accuracy",
  "PublishTime",
  "SalesPoint",
  "CustomerRating",
  "Title",
  "MyReviewCount",
]);

/**
 * 클라이언트에서 요청한 sort 값을 API에서 지원하는 형태로 매핑
 * PriceAsc / PriceDesc / DiscountDesc는 API 미지원 → "Accuracy"로 대체
 */
function mapSortToServer(sort: string | undefined): string {
  if (!sort || SERVER_SUPPORTED_SORTS.has(sort)) {
    return sort || "Accuracy";
  }
  // 클라이언트 전용 정렬은 서버에는 Accuracy를 보냄
  return "Accuracy";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("query");
  const queryType = searchParams.get("queryType") || "Keyword";
  const maxResults = searchParams.get("maxResults") || "10";
  const page = searchParams.get("page") || "1";
  const sort = searchParams.get("sort");

  if (!query) {
    return NextResponse.json(
      { error: "검색어(query)가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const url = new URL(ALADIN_API_BASE);
    url.searchParams.set("ttbkey", ALADIN_API_KEY);
    url.searchParams.set("Query", query);
    url.searchParams.set("QueryType", queryType);
    url.searchParams.set("SearchTarget", "Book");
    url.searchParams.set("MaxResults", maxResults);
    const start = (parseInt(page) - 1) * parseInt(maxResults) + 1;
    url.searchParams.set("Start", String(start));
    url.searchParams.set("Sort", mapSortToServer(sort || undefined));
    url.searchParams.set("Cover", "MidBig");
    url.searchParams.set("Output", "JS");
    url.searchParams.set("Version", "20131101");
    url.searchParams.set("OptResult", "usedList");

    const response = await fetch(url.toString());

    if (!response.ok) {
      return NextResponse.json(
        { error: "알라딘 API 요청 실패", status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 클라이언트에서 정렬 처리를 위해 요청한 sort 값을 응답에 포함
    return NextResponse.json({
      ...data,
      requestedSort: sort || "Accuracy",
    });
  } catch (error) {
    console.error("알라딘 API 호출 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
