"use client";

import { Fragment, useEffect, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fetchDataState } from "@/lib/fetch-data-state";
import { MAX_UPCOMING_EVENTS } from "@/lib/constants";
import { EconomicEvent } from "@/types/event";
import { DataState } from "@/types/market";

/**
 * Next MAX_UPCOMING_EVENTS economic events (spec section 17/10), from
 * the real FRED release calendar. Importance stars reflect the
 * editorial mapping documented in services/events/fred-releases.ts —
 * dates themselves are never invented.
 */
export function EventsPanel() {
  const [state, setState] = useState<DataState<EconomicEvent[]>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchDataState<EconomicEvent[]>("/api/events").then((result) => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Panel>
      <SectionHeader title="UPCOMING EVENTS" right={`MAX ${MAX_UPCOMING_EVENTS}`} />
      {state.status === "loading" && <StatusBadge kind="loading" />}
      {(state.status === "unavailable" || state.status === "error") && (
        <StatusBadge
          kind={state.status === "error" && state.message === "OFFLINE" ? "offline" : "unavailable"}
          detail={state.status === "unavailable" ? state.reason : undefined}
        />
      )}
      {state.status === "ok" && (
        <div className="grid grid-cols-[auto_auto_1fr_auto] gap-x-3 gap-y-1.5 font-mono text-micro">
          <span className="text-term-graydim">TIME</span>
          <span className="text-term-graydim">COUNTRY</span>
          <span className="text-term-graydim">EVENT</span>
          <span className="text-term-graydim">IMP.</span>
          {state.data.map((event) => (
            <Fragment key={event.id}>
              <span className="whitespace-nowrap text-term-white">
                {new Date(event.time).toLocaleString(undefined, {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="text-term-white">{event.country}</span>
              <span className="truncate text-term-white">{event.title}</span>
              <span className="text-term-orange">{"★".repeat(event.importance)}</span>
            </Fragment>
          ))}
        </div>
      )}
    </Panel>
  );
}
