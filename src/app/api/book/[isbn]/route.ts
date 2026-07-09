import { NextRequest, NextResponse } from "next/server";

const ALADIN_API_KEY = process.env.ALADIN_API_KEY!;
const ALADIN_LOOKUP_URL = "https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx";

// ItemLookUp API로 도서 상세 정보 + 중고 정보 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ isbn: string }> }
) {
  const { isbn } = await params;

  if (!isbn) {
    return NextResponse.json(
      { error: "ISBN이 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const url = new URL(ALADIN_LOOKUP_URL);
    url.searchParams.set("ttbkey", ALADIN_API_KEY);
    url.searchParams.set("itemIdType", "ISBN13");
    url.searchParams.set("ItemId", isbn);
    url.searchParams.set("Cover", "Big");
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

    // 도서가 없는 경우
    if (!data.item || data.item.length === 0) {
      return NextResponse.json(
        { error: "해당 ISBN의 도서를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(data.item[0]);
  } catch (error) {
    console.error("도서 상세 조회 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
