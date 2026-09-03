import { DataState, OhlcSeries, Quote, Timeframe } from "@/types/market";
import { getAssetConfig } from "@/lib/assets";
import { cacheGet, cacheSet, TTL } from "@/lib/cache";
import { getYahooQuote, getYahooOhlc } from "./yahoo";

/**
 * Market data service — the only layer the rest of the app should call
 * for prices. Resolves an asset's configured priceProvider to an
 * adapter, applies caching, and converts thrown errors into a
 * DataState so callers never have to guess whether a value is real.
 */

async function resolveProvider(symbol: string): Promise<"yahoo"> {
  const config = getAssetConfig(symbol);
  if (!config || !config.priceProvider) {
    throw new Error("No price provider configured for this asset");
  }
  // Only one adapter exists today; this indirection is what STEP 12 refactors
  // into a real adapter registry if a second provider is added.
  if (config.priceProvider !== "yahoo") {
    throw new Error(`Unsupported provider: ${config.priceProvider}`);
  }
  return "yahoo";
}

export async function getQuote(symbol: string): Promise<DataState<Quote>> {
  const cacheKey = `quote:${symbol}`;
  const cached = cacheGet<Quote>(cacheKey);
  if (cached) return { status: "ok", data: cached };

  try {
    await resolveProvider(symbol);
    const quote = await getYahooQuote(symbol);
    cacheSet(cacheKey, quote, TTL.quote);
    return { status: "ok", data: quote };
  } catch (err) {
    return {
      status: "unavailable",
      reason: err instanceof Error ? err.message : "Unknown error fetching quote",
    };
  }
}

export async function getOhlc(
  symbol: string,
  timeframe: Timeframe
): Promise<DataState<OhlcSeries>> {
  const cacheKey = `ohlc:${symbol}:${timeframe}`;
  const cached = cacheGet<OhlcSeries>(cacheKey);
  if (cached) return { status: "ok", data: cached };

  try {
    await resolveProvider(symbol);
    const series = await getYahooOhlc(symbol, timeframe);
    cacheSet(cacheKey, series, TTL.ohlc);
    return { status: "ok", data: series };
  } catch (err) {
    return {
      status: "unavailable",
      reason: err instanceof Error ? err.message : "Unknown error fetching OHLC data",
    };
  }
}

/** Fetches quotes for several symbols independently — one failure never blocks the rest. */
export async function getQuotes(symbols: string[]): Promise<Record<string, DataState<Quote>>> {
  const entries = await Promise.all(
    symbols.map(async (symbol) => {
      const cacheKey = `quote:${symbol}`;
      const cached = cacheGet<Quote>(cacheKey);
      if (cached) return [symbol, { status: "ok", data: cached } as DataState<Quote>] as const;
      try {
        const quote = await getYahooQuote(symbol);
        cacheSet(cacheKey, quote, TTL.quote);
        return [symbol, { status: "ok", data: quote } as DataState<Quote>] as const;
      } catch (err) {
        return [
          symbol,
          {
            status: "unavailable",
            reason: err instanceof Error ? err.message : "Unknown error",
          } as DataState<Quote>,
        ] as const;
      }
    })
  );
  return Object.fromEntries(entries);
}
