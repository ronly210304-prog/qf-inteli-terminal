import { SentimentPoint, SentimentSeries } from "@/types/sentiment";

/**
 * Alternative.me Crypto Fear & Greed Index adapter.
 *
 *   GET https://api.alternative.me/fng/?limit=N&format=json
 *
 * Real, free, public, no API key required. Crypto-only by design —
 * it is NOT used for NQ/NASDAQ sentiment because no equivalent free,
 * legitimate (non-scraped) source was found for equities during this
 * project's research. See services/sentiment/index.ts for how NQ
 * sentiment honestly resolves to "unavailable" instead.
 */

interface AlternativeMeResponse {
  data: Array<{
    value: string;
    value_classification: string;
    timestamp: string;
  }>;
}

export async function getBtcFearGreed(days: number): Promise<SentimentSeries> {
  const url = `https://api.alternative.me/fng/?limit=${days}&format=json`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Alternative.me API returned HTTP ${res.status}`);
  }

  const json = (await res.json()) as AlternativeMeResponse;
  if (!json.data || json.data.length === 0) {
    throw new Error("Alternative.me API returned no data");
  }

  const points: SentimentPoint[] = json.data
    .map((d) => ({
      date: new Date(parseInt(d.timestamp, 10) * 1000).toISOString().slice(0, 10),
      value: parseInt(d.value, 10),
      label: d.value_classification,
    }))
    .reverse(); // API returns newest-first; chart wants chronological order

  return {
    assetSymbol: "BTC-USD",
    points,
    source: "Alternative.me Crypto Fear & Greed Index",
  };
}
