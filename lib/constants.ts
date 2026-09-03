import { IndicatorDefinition } from "@/types/indicator";

export const APP_NAME = "QF INTELI TERMINAL";

/**
 * Indicator catalogue and default on/off state, per spec section 10.
 * MA20/60/99 default ON. BB/RSI/MACD default OFF.
 */
export const INDICATOR_DEFINITIONS: IndicatorDefinition[] = [
  { id: "ma20", label: "MA20", panel: "overlay", defaultEnabled: true },
  { id: "ma60", label: "MA60", panel: "overlay", defaultEnabled: true },
  { id: "ma99", label: "MA99", panel: "overlay", defaultEnabled: true },
  { id: "bb", label: "BB", panel: "overlay", defaultEnabled: false },
  { id: "rsi", label: "RSI", panel: "separate", defaultEnabled: false },
  { id: "macd", label: "MACD", panel: "separate", defaultEnabled: false },
];

/** Max upcoming economic events shown, per spec section 17. */
export const MAX_UPCOMING_EVENTS = 3;

/** Shared text for empty/unavailable data states. Never replaced with sample values. */
export const DATA_STATE_LABEL = {
  loading: "LOADING",
  unavailable: "NO DATA",
  na: "N/A",
  offline: "OFFLINE",
} as const;
