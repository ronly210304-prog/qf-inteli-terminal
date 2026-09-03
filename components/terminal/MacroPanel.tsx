"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fetchDataState } from "@/lib/fetch-data-state";
import { MacroDataPoint } from "@/types/macro";
import { DataState } from "@/types/market";
import { useTerminal } from "./TerminalProvider";

type MacroResponse = Record<string, DataState<MacroDataPoint>>;

/**
 * Macro indicators (spec section 15/8), each showing VALUE and its
 * real release DATE from FRED — labeled RELEASE so it's never mistaken
 * for a live market price, per spec's explicit requirement.
 */
export function MacroPanel() {
  const { asset } = useTerminal();
  const [state, setState] = useState<DataState<MacroResponse>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchDataState<MacroResponse>(`/api/macro?symbol=${encodeURIComponent(asset.symbol)}`).then((result) => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, [asset.symbol]);

  return (
    <Panel>
      <SectionHeader title="MACRO" right="RELEASE DATA" />
      {state.status === "loading" && <StatusBadge kind="loading" />}
      {(state.status === "unavailable" || state.status === "error") && (
        <StatusBadge kind={state.status === "error" && state.message === "OFFLINE" ? "offline" : "unavailable"} />
      )}
      {state.status === "ok" && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {Object.entries(state.data).map(([id, point]) => (
            <div key={id} className="min-w-0">
              <div className="truncate font-mono text-micro text-term-graydim">
                {point.status === "ok" ? point.data.label : id.toUpperCase()}
              </div>
              <div className="mt-0.5 font-mono text-term-white">
                {point.status === "ok" ? `${point.data.value} ${point.data.unit}` : "N/A"}
              </div>
              {point.status === "ok" && (
                <div className="font-mono text-micro text-term-graydim">{point.data.date}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
