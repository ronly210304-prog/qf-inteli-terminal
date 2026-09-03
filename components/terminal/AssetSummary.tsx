"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { fetchDataState } from "@/lib/fetch-data-state";
import { cx } from "@/lib/utils";
import { DataState, Quote } from "@/types/market";
import { useTerminal } from "./TerminalProvider";

/**
 * Price summary: LAST / CHANGE.
 *
 * The original spec listed LAST / CHANGE / HIGH / LOW / VOLUME. Yahoo's
 * free quote meta doesn't expose a clean session HIGH/LOW/VOLUME —
 * that's a structural gap (no free source), not a transient failure —
 * so those three fields were removed entirely rather than sit as a
 * permanent "N/A" that never resolves. Per spec: "A missing section
 * is acceptable" — the same principle applied at the field level here.
 */
export function AssetSummary() {
  const { asset } = useTerminal();
  const [state, setState] = useState<DataState<Quote>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchDataState<Quote>(`/api/market/quote?symbol=${encodeURIComponent(asset.symbol)}`).then(
      (result) => {
        if (!cancelled) setState(result);
      }
    );
    const interval = setInterval(() => {
      fetchDataState<Quote>(`/api/market/quote?symbol=${encodeURIComponent(asset.symbol)}`).then(
        (result) => {
          if (!cancelled) setState(result);
        }
      );
    }, 15_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [asset.symbol]);

  const quote = state.status === "ok" ? state.data : null;
  const changeSign = quote && quote.change >= 0 ? "+" : "";
  const changeColor = quote ? (quote.change >= 0 ? "text-term-green" : "text-term-red") : "text-term-graydim";

  return (
    <Panel>
      <div className="font-mono text-micro text-term-gray">{asset.shortLabel}</div>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <div className="truncate text-micro text-term-graydim">LAST</div>
          <div className="mt-0.5 truncate font-mono text-term-white text-2xl">
            {quote ? quote.last.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "N/A"}
          </div>
        </div>
        <div className="min-w-0">
          <div className="truncate text-micro text-term-graydim">CHANGE</div>
          <div className={cx("mt-0.5 truncate font-mono text-lg", changeColor)}>
            {quote
              ? `${changeSign}${quote.change.toFixed(2)} (${changeSign}${quote.changePercent.toFixed(2)}%)`
              : "N/A"}
          </div>
        </div>
      </div>
      <div className="mt-2 border-t border-term-borderdim pt-1.5 font-mono text-micro text-term-graydim">
        {state.status === "loading" && "LOADING"}
        {state.status === "unavailable" && `NO DATA — ${state.reason ?? ""}`}
        {state.status === "error" && (state.message === "OFFLINE" ? "OFFLINE" : "NO DATA")}
        {state.status === "ok" && `Source: ${state.data.source} · as of ${new Date(state.data.asOf).toLocaleTimeString()}`}
      </div>
    </Panel>
  );
}
