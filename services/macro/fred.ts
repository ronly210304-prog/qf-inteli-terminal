import { MacroDataPoint } from "@/types/macro";

/**
 * FRED (Federal Reserve Economic Data, St. Louis Fed) adapter.
 *
 *   GET https://api.stlouisfed.org/fred/series/observations
 *       ?series_id=...&api_key=...&file_type=json&sort_order=desc&limit=1
 *
 * FRED is a real, official, free public-data source. It requires a
 * free API key (personal registration, no cost, no paid tier needed):
 * https://fred.stlouisfed.org/docs/api/api_key.html
 *
 * The key MUST be set server-side as the FRED_API_KEY environment
 * variable — see .env.example. If it is not set, this adapter throws
 * and the macro service returns "unavailable" (N/A in the UI) rather
 * than fabricating a value. No other behavior changes.
 */

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

// Real FRED series IDs for the six indicators in spec section 15.
export const MACRO_SERIES: Record<string, { seriesId: string; unit: string; label: string }> = {
  fedfunds: { seriesId: "FEDFUNDS", unit: "%", label: "FED FUNDS" },
  cpi: { seriesId: "CPIAUCSL", unit: "index", label: "CPI" },
  pce: { seriesId: "PCEPI", unit: "index", label: "PCE" },
  gdp: { seriesId: "GDP", unit: "$B", label: "GDP" },
  unemployment: { seriesId: "UNRATE", unit: "%", label: "UNEMPLOYMENT" },
  m2: { seriesId: "M2SL", unit: "$B", label: "M2" },
};

interface FredObservationsResponse {
  observations: Array<{ date: string; value: string }>;
}

export async function getFredLatest(indicatorId: string): Promise<MacroDataPoint> {
  const series = MACRO_SERIES[indicatorId];
  if (!series) {
    throw new Error(`Unknown macro indicator: ${indicatorId}`);
  }

  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    throw new Error("FRED_API_KEY is not configured on the server");
  }

  const url = `${FRED_BASE}?series_id=${series.seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`FRED API returned HTTP ${res.status} for ${series.seriesId}`);
  }

  const json = (await res.json()) as FredObservationsResponse;
  const latest = json.observations?.[0];

  if (!latest || latest.value === "." || latest.value === undefined) {
    throw new Error(`FRED API returned no usable observation for ${series.seriesId}`);
  }

  return {
    id: indicatorId,
    label: series.label,
    value: parseFloat(latest.value),
    unit: series.unit,
    date: latest.date,
    source: "FRED (Federal Reserve Bank of St. Louis)",
    kind: "release",
  };
}
