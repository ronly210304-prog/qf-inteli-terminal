import { NextRequest, NextResponse } from "next/server";
import { getOhlc } from "@/services/market";
import { Timeframe } from "@/types/market";

const VALID_TIMEFRAMES: Timeframe[] = ["1m", "5m", "15m", "1h", "4h", "1D"];

/**
 * GET /api/market/ohlc?symbol=NQ=F&timeframe=1D
 */
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  const timeframeParam = req.nextUrl.searchParams.get("timeframe") ?? "1D";

  if (!symbol) {
    return NextResponse.json({ status: "error", message: "Missing symbol" }, { status: 400 });
  }
  if (!VALID_TIMEFRAMES.includes(timeframeParam as Timeframe)) {
    return NextResponse.json({ status: "error", message: "Invalid timeframe" }, { status: 400 });
  }

  const result = await getOhlc(symbol, timeframeParam as Timeframe);
  return NextResponse.json(result);
}
