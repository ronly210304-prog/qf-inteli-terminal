/**
 * Market data types.
 *
 * These describe the SHAPE of real data once a provider is connected.
 * No mock/sample instances of these types should ever be created —
 * only the provider adapter (services/market) may produce them, and
 * only from a real upstream response.
 */

export interface Quote {
  symbol: string;
  last: number;
  change: number;
  changePercent: number;
  /** ISO 8601 timestamp of the quote. */
  asOf: string;
  /** Data source identifier, for the UI to show provenance if needed. */
  source: string;
}

export interface OhlcBar {
  /** Unix time (seconds), matching TradingView Lightweight Charts' expected format. */
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1D";

export interface OhlcSeries {
  symbol: string;
  timeframe: Timeframe;
  bars: OhlcBar[];
  source: string;
}

/** Represents "we tried to load this and there is nothing to show" — never fabricated. */
export type DataState<T> =
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "unavailable"; reason?: string }
  | { status: "error"; message: string };
