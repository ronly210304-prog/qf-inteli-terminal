export interface SentimentPoint {
  /** ISO date, e.g. "2026-08-30" */
  date: string;
  /** 0-100 scale value, e.g. Fear & Greed. */
  value: number;
  label?: string;
}

export interface SentimentSeries {
  assetSymbol: string;
  points: SentimentPoint[];
  source: string;
}
