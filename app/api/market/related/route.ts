import { NextRequest, NextResponse } from "next/server";
import { getQuotes } from "@/services/market";
import { getAssetConfig } from "@/lib/assets";

/**
 * GET /api/market/related?symbol=NQ=F
 * Returns quotes for the given asset's configured relatedMarkets,
 * each with its own independent DataState — one bad symbol never
 * blocks the rest of the table.
 */
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ status: "error", message: "Missing symbol" }, { status: 400 });
  }
  const config = getAssetConfig(symbol);
  if (!config) {
    return NextResponse.json({ status: "error", message: "Unknown asset" }, { status: 404 });
  }
  const quotes = await getQuotes(config.relatedMarkets);
  return NextResponse.json({ status: "ok", data: quotes });
}
