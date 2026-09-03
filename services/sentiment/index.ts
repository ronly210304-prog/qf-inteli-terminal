import { DataState } from "@/types/market";
import { SentimentSeries } from "@/types/sentiment";
import { cacheGet, cacheSet, TTL } from "@/lib/cache";
import { SENTIMENT_SUPPORTED_SYMBOLS } from "@/lib/assets";
import { getBtcFearGreed } from "./alternative-me";

/**
 * Sentiment is only wired up for symbols in SENTIMENT_SUPPORTED_SYMBOLS
 * (currently just BTC-USD — see that constant's doc comment). Any
 * other symbol resolves to "unavailable" without attempting a fetch;
 * the client (SentimentPanel) uses the same constant to hide the
 * panel entirely for those assets rather than show permanent NO DATA.
 */
export async function getSentiment(symbol: string, days = 7): Promise<DataState<SentimentSeries>> {
  if (!SENTIMENT_SUPPORTED_SYMBOLS.includes(symbol)) {
    return {
      status: "unavailable",
      reason: "No legitimate free sentiment source identified for this asset",
    };
  }

  const cacheKey = `sentiment:${symbol}:${days}`;
  const cached = cacheGet<SentimentSeries>(cacheKey);
  if (cached) return { status: "ok", data: cached };

  try {
    const series = await getBtcFearGreed(days);
    cacheSet(cacheKey, series, TTL.sentiment);
    return { status: "ok", data: series };
  } catch (err) {
    return {
      status: "unavailable",
      reason: err instanceof Error ? err.message : "Unknown error fetching sentiment",
    };
  }
}
