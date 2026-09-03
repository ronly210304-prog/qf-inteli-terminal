export interface MacroDataPoint {
  id: string;
  label: string;
  value: number;
  unit: string;
  /** Date the value was released/observed for (not necessarily today). */
  date: string;
  source: string;
  /**
   * True release data (e.g. last CPI print) vs. a real-time market price
   * (e.g. 10Y yield). The UI must never present one as the other.
   */
  kind: "release" | "market";
}
