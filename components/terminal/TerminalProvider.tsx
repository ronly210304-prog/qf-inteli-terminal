"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { DEFAULT_ASSET_SYMBOL, getAssetConfig } from "@/lib/assets";
import { getDefaultIndicatorState } from "@/lib/utils";
import { AssetConfig } from "@/types/asset";
import { IndicatorId, IndicatorState } from "@/types/indicator";
import { Timeframe } from "@/types/market";

interface TerminalContextValue {
  asset: AssetConfig;
  setAssetSymbol: (symbol: string) => void;
  indicators: IndicatorState;
  toggleIndicator: (id: IndicatorId) => void;
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  selectorOpen: boolean;
  openSelector: () => void;
  closeSelector: () => void;
}

const TerminalContext = createContext<TerminalContextValue | null>(null);

/**
 * Shared client state for the whole terminal screen: which asset is
 * selected (STEP 11) and which indicators are toggled on (STEP 5).
 * A server-rendered layout can't hold interactive state, so this one
 * client boundary wraps the page and every panel reads from it —
 * changing the asset re-fetches price/chart/news/related/macro in
 * each panel independently, per spec section 18.
 */
export function TerminalProvider({ children }: { children: ReactNode }) {
  const [assetSymbol, setAssetSymbol] = useState(DEFAULT_ASSET_SYMBOL);
  const [indicators, setIndicators] = useState<IndicatorState>(getDefaultIndicatorState);
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const [selectorOpen, setSelectorOpen] = useState(false);

  const asset = getAssetConfig(assetSymbol) ?? getAssetConfig(DEFAULT_ASSET_SYMBOL)!;

  function toggleIndicator(id: IndicatorId) {
    setIndicators((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <TerminalContext.Provider
      value={{
        asset,
        setAssetSymbol,
        indicators,
        toggleIndicator,
        timeframe,
        setTimeframe,
        selectorOpen,
        openSelector: () => setSelectorOpen(true),
        closeSelector: () => setSelectorOpen(false),
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal(): TerminalContextValue {
  const ctx = useContext(TerminalContext);
  if (!ctx) {
    throw new Error("useTerminal must be used within a TerminalProvider");
  }
  return ctx;
}
