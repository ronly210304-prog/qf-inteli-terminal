"use client";

import { Fragment, useEffect, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RELATED_MARKET_LABELS } from "@/lib/assets";
import { fetchDataState } from "@/lib/fetch-data-state";
import { cx } from "@/lib/utils";
import { DataState, Quote } from "@/types/market";
import { useTerminal } from "./TerminalProvider";

type RelatedResponse = Record<string, DataState<Quote>>;

/**
 * Related markets table (spec section 14/6): MARKET / LAST / CHG.
 * Each symbol resolves independently — a bad quote for one market
 * never blanks the rest of the table (spec section 14/21).
 */
export function MarketDataTable() {
  const { asset } = useTerminal();
  const [state, setState] = useState<DataState<RelatedResponse>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchDataState<RelatedResponse>(`/api/market/related?symbol=${encodeURIComponent(asset.symbol)}`).then(
      (result) => {
        if (!cancelled) setState(result);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [asset.symbol]);

  return (
    <Panel>
      <SectionHeader title="RELATED MARKETS" />
      {state.status === "loading" && <StatusBadge kind="loading" />}
      {(state.status === "unavailable" || state.status === "error") && (
        <StatusBadge kind={state.status === "error" && state.message === "OFFLINE" ? "offline" : "unavailable"} />
      )}
      {state.status === "ok" && (
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1.5 font-mono text-micro">
          <span className="text-term-graydim">MARKET</span>
          <span className="text-right text-term-graydim">LAST</span>
          <span className="text-right text-term-graydim">CHG</span>
          {Object.entries(state.data).map(([symbol, quoteState]) => (
            <Fragment key={symbol}>
              <span className="truncate text-term-white">
                {RELATED_MARKET_LABELS[symbol] ?? symbol}
              </span>
              <span className="text-right text-term-graydim">
                {quoteState.status === "ok"
                  ? quoteState.data.last.toLocaleString(undefined, { maximumFractionDigits: 2 })
                  : "N/A"}
              </span>
              <span
                className={cx(
                  "text-right",
                  quoteState.status === "ok"
                    ? quoteState.data.change >= 0
                      ? "text-term-green"
                      : "text-term-red"
                    : "text-term-graydim"
                )}
              >
                {quoteState.status === "ok" ? `${quoteState.data.change >= 0 ? "+" : ""}${quoteState.data.changePercent.toFixed(2)}%` : "N/A"}
              </span>
            </Fragment>
          ))}
        </div>
      )}
    </Panel>
  );
}
