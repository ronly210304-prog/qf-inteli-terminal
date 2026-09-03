import { NextRequest, NextResponse } from "next/server";
import { getNews } from "@/services/news";
import { getAssetConfig } from "@/lib/assets";

export const dynamic = "force-dynamic";

/** GET /api/news?symbol=NQ=F */
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ status: "error", message: "Missing symbol" }, { status: 400 });
  }
  const config = getAssetConfig(symbol);
  if (!config) {
    return NextResponse.json({ status: "error", message: "Unknown asset" }, { status: 404 });
  }
  const result = await getNews(config.newsKeywords);
  return NextResponse.json(result);
}
