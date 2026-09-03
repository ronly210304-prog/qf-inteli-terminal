import { NextRequest, NextResponse } from "next/server";
import { getSentiment } from "@/services/sentiment";

export const dynamic = "force-dynamic";

/** GET /api/sentiment?symbol=BTC-USD */
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ status: "error", message: "Missing symbol" }, { status: 400 });
  }
  const result = await getSentiment(symbol, 7);
  return NextResponse.json(result);
}
