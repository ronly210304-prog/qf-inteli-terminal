"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fetchDataState } from "@/lib/fetch-data-state";
import { SENTIMENT_SUPPORTED_SYMBOLS } from "@/lib/assets";
import { DataState } from "@/types/market";
import { SentimentSeries } from "@/types/sentiment";
import { useTerminal } from "./TerminalProvider";

/**
 * Daily horizontal bar sentiment visualization (spec section 16/9).
 *
 * Real data only exists for symbols in SENTIMENT_SUPPORTED_SYMBOLS
 * (BTC-USD, via Alternative.me Fear & Greed). For every other asset
 * there is no free source at all — that's a structural gap, not a
 * transient failure — so rather than render a permanent "NO DATA" box,
 * the whole panel is omitted from the page. Per spec: "A missing
 * section is acceptable." A genuine transient failure (network down,
 * source temporarily unreachable) for a SUPPORTED symbol still shows
 * the normal NO DATA / OFFLINE states below.
 */
export function SentimentPanel() {
  const { asset } = useTerminal();
  const [state, setState] = useState<DataState<SentimentSeries>>({ status: "loading" });

  const supported = SENTIMENT_SUPPORTED_SYMBOLS.includes(asset.symbol);

  useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    setState({ status: "loading" });
    fetchDataState<SentimentSeries>(`/api/sentiment?symbol=${encodeURIComponent(asset.symbol)}`).then(
      (result) => {
        if (!cancelled) setState(result);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [asset.symbol, supported]);

  if (!supported) return null;

  return (
    <Panel>
      <SectionHeader title="SENTIMENT" />
      {state.status === "loading" && <StatusBadge kind="loading" />}
      {(state.status === "unavailable" || state.status === "error") && (
        <StatusBadge
          kind={state.status === "error" && state.message === "OFFLINE" ? "offline" : "unavailable"}
          detail={state.status === "unavailable" ? state.reason : undefined}
        />
      )}
      {state.status === "ok" && (
        <div className="flex flex-col gap-1.5">
          {state.data.points.map((p) => (
            <div key={p.date} className="grid grid-cols-[64px_1fr_32px] items-center gap-2 font-mono text-micro">
              <span className="text-term-graydim">{p.date.slice(5)}</span>
              <div className="h-2.5 bg-term-borderdim">
                <div
                  className="h-full bg-term-yellow"
                  style={{ width: `${Math.max(0, Math.min(100, p.value))}%` }}
                />
              </div>
              <span className="text-right text-term-white">{p.value}</span>
            </div>
          ))}
          <div className="mt-1 font-mono text-micro text-term-graydim">Source: {state.data.source}</div>
        </div>
      )}
    </Panel>
  );
}
