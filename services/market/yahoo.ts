import { OhlcBar, OhlcSeries, Quote, Timeframe } from "@/types/market";

/**
 * Yahoo Finance chart endpoint adapter.
 *
 * GET https://query1.finance.yahoo.com/v8/finance/chart/{symbol}
 *
 * This endpoint is UNOFFICIAL: Yahoo discontinued its documented public
 * API in 2017. This is the same JSON endpoint finance.yahoo.com's own
 * website calls, still active as of 2026, requires no API key, and has
 * no published rate limit (community-observed safe zone is well under
 * ~2 requests/second sustained — this app's caching keeps it far below
 * that). Because it is unofficial, it can change or disappear without
 * notice, and Yahoo's terms restrict use to personal/non-commercial
 * purposes. This matches the "personal Market Intelligence Terminal"
 * brief. See the final implementation report for the full disclosure.
 *
 * It is used here (rather than scraping finance.yahoo.com's HTML) because
 * it returns clean structured JSON and covers futures (NQ=F), indices
 * (^NDX) and ETFs (QQQ) from a single source — required to distinguish
 * those three instruments correctly per spec.
 */

const YAHOO_CHART_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

// Yahoo's `range`/`interval` vocabulary, mapped from our Timeframe type.
const TIMEFRAME_TO_YAHOO: Record<Timeframe, { range: string; interval: string }> = {
  "1m": { range: "1d", interval: "1m" },
  "5m": { range: "5d", interval: "5m" },
  "15m": { range: "5d", interval: "15m" },
  "1h": { range: "1mo", interval: "60m" },
  "4h": { range: "3mo", interval: "60m" }, // Yahoo has no native 4h; 1h bars, chart can aggregate later if needed
  "1D": { range: "1y", interval: "1d" },
};

interface YahooChartResponse {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice?: number;
        previousClose?: number;
        chartPreviousClose?: number;
        regularMarketTime?: number;
      };
      timestamp?: number[];
      indicators: {
        quote: Array<{
          open?: (number | null)[];
          high?: (number | null)[];
          low?: (number | null)[];
          close?: (number | null)[];
          volume?: (number | null)[];
        }>;
      };
    }> | null;
    error: { code: string; description: string } | null;
  };
}

async function fetchYahooChart(
  symbol: string,
  range: string,
  interval: string
): Promise<YahooChartResponse> {
  const url = `${YAHOO_CHART_BASE}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const res = await fetch(url, {
    headers: {
      // A browser-like UA reduces (but doesn't guarantee against) trivial bot blocking.
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "application/json",
    },
    // Server-side fetch — never exposed to the client.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Yahoo chart endpoint returned HTTP ${res.status}`);
  }

  const json = (await res.json()) as YahooChartResponse;
  if (json.chart.error) {
    throw new Error(`Yahoo chart endpoint error: ${json.chart.error.description}`);
  }
  if (!json.chart.result || json.chart.result.length === 0) {
    throw new Error("Yahoo chart endpoint returned no result for symbol");
  }
  return json;
}

export async function getYahooQuote(symbol: string): Promise<Quote> {
  const json = await fetchYahooChart(symbol, "1d", "1m");
  const result = json.chart.result![0];
  const last = result.meta.regularMarketPrice;
  const prevClose = result.meta.previousClose ?? result.meta.chartPreviousClose;

  if (typeof last !== "number" || typeof prevClose !== "number") {
    throw new Error("Yahoo chart endpoint did not include a current price for symbol");
  }

  const change = last - prevClose;
  const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

  return {
    symbol,
    last,
    change,
    changePercent,
    asOf: result.meta.regularMarketTime
      ? new Date(result.meta.regularMarketTime * 1000).toISOString()
      : new Date().toISOString(),
    source: "Yahoo Finance (unofficial chart endpoint)",
  };
}

export async function getYahooOhlc(
  symbol: string,
  timeframe: Timeframe
): Promise<OhlcSeries> {
  const { range, interval } = TIMEFRAME_TO_YAHOO[timeframe];
  const json = await fetchYahooChart(symbol, range, interval);
  const result = json.chart.result![0];
  const timestamps = result.timestamp ?? [];
  const quote = result.indicators.quote[0] ?? {};

  const bars: OhlcBar[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const open = quote.open?.[i];
    const high = quote.high?.[i];
    const low = quote.low?.[i];
    const close = quote.close?.[i];
    // Yahoo pads gaps (pre-market, holidays) with null — skip incomplete bars
    // rather than plotting a fabricated candle.
    if (
      open == null ||
      high == null ||
      low == null ||
      close == null
    ) {
      continue;
    }
    bars.push({
      time: timestamps[i],
      open,
      high,
      low,
      close,
      volume: quote.volume?.[i] ?? undefined,
    });
  }

  if (bars.length === 0) {
    throw new Error("Yahoo chart endpoint returned no usable OHLC bars for symbol");
  }

  return {
    symbol,
    timeframe,
    bars,
    source: "Yahoo Finance (unofficial chart endpoint)",
  };
}
