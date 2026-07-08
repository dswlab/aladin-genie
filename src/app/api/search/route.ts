import { NextRequest, NextResponse } from "next/server";

const ALADIN_API_KEY = process.env.ALADIN_API_KEY!;
const ALADIN_API_BASE = "http://www.aladin.co.kr/ttb/api/ItemSearch.aspx";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("query");
  const queryType = searchParams.get("queryType") || "Keyword";
  const maxResults = searchParams.get("maxResults") || "10";

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
    url.searchParams.set("Start", "1");
    url.searchParams.set("Sort", "Accuracy");
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
    return NextResponse.json(data);
  } catch (error) {
    console.error("알라딘 API 호출 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
