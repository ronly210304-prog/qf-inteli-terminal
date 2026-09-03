"use client";

import { Fragment, useMemo, useState } from "react";
import { getActiveAssets } from "@/lib/assets";
import { cx } from "@/lib/utils";
import { AssetConfig } from "@/types/asset";
import { useTerminal } from "./TerminalProvider";

const CATEGORY_LABELS: Record<AssetConfig["assetType"], string> = {
  future: "FUTURES",
  index: "INDICES",
  etf: "ETFS",
  crypto: "CRYPTO",
  fx: "FX",
  commodity: "COMMODITIES",
  rate: "RATES",
};

const CATEGORY_ORDER: AssetConfig["assetType"][] = [
  "index",
  "future",
  "etf",
  "crypto",
  "commodity",
  "fx",
  "rate",
];

/**
 * Full-screen asset picker (STEP 11). Only assets with isActive: true
 * (a real data path) are listed — inactive assets from lib/assets.ts
 * are intentionally excluded rather than shown as selectable dead ends.
 * Grouped by category since the active list now spans ~20 instruments
 * across indices/futures/ETFs/crypto/commodities/FX/rates.
 */
export function AssetSelector() {
  const { asset, setAssetSymbol, selectorOpen, closeSelector } = useTerminal();
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const active = getActiveAssets();
    const q = query.toLowerCase();
    const filtered = active.filter(
      (a) => a.displayName.toLowerCase().includes(q) || a.shortLabel.toLowerCase().includes(q)
    );
    const byCategory = new Map<AssetConfig["assetType"], AssetConfig[]>();
    for (const type of CATEGORY_ORDER) byCategory.set(type, []);
    for (const a of filtered) {
      byCategory.get(a.assetType)?.push(a);
    }
    return byCategory;
  }, [query]);

  if (!selectorOpen) return null;

  const hasResults = Array.from(grouped.values()).some((list) => list.length > 0);

  return (
    <div className="fixed inset-0 z-20 flex flex-col bg-term-black">
      <div className="flex items-center gap-2 border-b border-term-border p-3">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SEARCH ASSET"
          className="flex-1 border border-term-border bg-term-charcoal px-2 py-1.5 font-mono text-term text-term-white placeholder:text-term-graydim focus:outline-none"
        />
        <button
          type="button"
          onClick={closeSelector}
          className="border border-term-border px-2.5 py-1.5 font-mono text-micro text-term-gray"
        >
          CLOSE
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {CATEGORY_ORDER.map((type) => {
          const list = grouped.get(type) ?? [];
          if (list.length === 0) return null;
          return (
            <Fragment key={type}>
              <div className="sticky top-0 bg-term-black px-3 py-1.5 font-mono text-micro text-term-gray border-b border-term-borderdim">
                {CATEGORY_LABELS[type]}
              </div>
              {list.map((a) => (
                <button
                  key={a.symbol}
                  type="button"
                  onClick={() => {
                    setAssetSymbol(a.symbol);
                    setQuery("");
                    closeSelector();
                  }}
                  className={cx(
                    "flex w-full items-center justify-between border-b border-term-borderdim px-3 py-3 text-left font-mono",
                    a.symbol === asset.symbol ? "bg-term-charcoal" : ""
                  )}
                >
                  <span>
                    <span className="block text-term text-term-white">{a.shortLabel}</span>
                    <span className="block text-micro text-term-gray">{a.displayName}</span>
                  </span>
                  {a.symbol === asset.symbol && <span className="text-term-green">●</span>}
                </button>
              ))}
            </Fragment>
          );
        })}
        {!hasResults && (
          <div className="p-4 text-center font-mono text-micro text-term-graydim">
            NO MATCHING ASSET
          </div>
        )}
      </div>
    </div>
  );
}
