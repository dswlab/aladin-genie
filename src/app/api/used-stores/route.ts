import { NextRequest, NextResponse } from "next/server";

const ALADIN_API_KEY = process.env.ALADIN_API_KEY!;
const ALADIN_OFFSTORE_URL =
  "https://www.aladin.co.kr/ttb/api/ItemOffStoreList.aspx";

// ItemOffStoreList API로 중고 보유 매장 목록 조회
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const isbn = searchParams.get("isbn");

  if (!isbn) {
    return NextResponse.json(
      { error: "ISBN이 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const url = new URL(ALADIN_OFFSTORE_URL);
    url.searchParams.set("ttbkey", ALADIN_API_KEY);
    url.searchParams.set("itemIdType", "ISBN13");
    url.searchParams.set("ItemId", isbn);
    url.searchParams.set("Output", "JS");

    const response = await fetch(url.toString());

    if (!response.ok) {
      return NextResponse.json(
        { error: "알라딘 API 요청 실패", status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    const stores = data.itemOffStoreList || [];

    return NextResponse.json({ stores });
  } catch (error) {
    console.error("중고 매장 조회 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
