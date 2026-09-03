import { NextRequest, NextResponse } from "next/server";
import { getMacroSnapshot } from "@/services/macro";
import { getAssetConfig } from "@/lib/assets";

export const dynamic = "force-dynamic";

/** GET /api/macro?symbol=NQ=F */
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ status: "error", message: "Missing symbol" }, { status: 400 });
  }
  const config = getAssetConfig(symbol);
  if (!config) {
    return NextResponse.json({ status: "error", message: "Unknown asset" }, { status: 404 });
  }
  const snapshot = await getMacroSnapshot(config.macroRelevance);
  return NextResponse.json({ status: "ok", data: snapshot });
}
