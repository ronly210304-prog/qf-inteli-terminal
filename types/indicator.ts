/**
 * Indicator configuration and state.
 *
 * Indicator VALUES are always derived locally from real OhlcBar data
 * (see types/market.ts). This file only describes which indicators
 * exist and whether they're toggled on — no calculation logic and no
 * numeric values live here.
 */

export type IndicatorId = "ma20" | "ma60" | "ma99" | "bb" | "rsi" | "macd";

export type IndicatorPanelType = "overlay" | "separate";

export interface IndicatorDefinition {
  id: IndicatorId;
  label: string;
  panel: IndicatorPanelType;
  /** Default on/off state when the terminal first loads. */
  defaultEnabled: boolean;
}

export type IndicatorState = Record<IndicatorId, boolean>;
