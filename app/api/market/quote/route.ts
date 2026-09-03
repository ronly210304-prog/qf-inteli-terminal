import { NextRequest, NextResponse } from "next/server";
import { getQuote } from "@/services/market";

/**
 * GET /api/market/quote?symbol=NQ=F
 * Server-side route — the browser never calls Yahoo directly.
 */
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ status: "error", message: "Missing symbol" }, { status: 400 });
  }
  const result = await getQuote(symbol);
  return NextResponse.json(result);
}
