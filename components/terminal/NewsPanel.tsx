"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fetchDataState } from "@/lib/fetch-data-state";
import { DataState } from "@/types/market";
import { NewsItem } from "@/types/news";
import { useTerminal } from "./TerminalProvider";

/**
 * News list (spec section 13/7): TIME / SOURCE / HEADLINE, newest
 * first, tapping a headline opens the original article. No article
 * text is ever fetched — only what the RSS feed itself provides.
 */
export function NewsPanel() {
  const { asset } = useTerminal();
  const [state, setState] = useState<DataState<NewsItem[]>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchDataState<NewsItem[]>(`/api/news?symbol=${encodeURIComponent(asset.symbol)}`).then((result) => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, [asset.symbol]);

  return (
    <Panel>
      <SectionHeader title="NEWS" />
      {state.status === "loading" && <StatusBadge kind="loading" />}
      {(state.status === "unavailable" || state.status === "error") && (
        <StatusBadge kind={state.status === "error" && state.message === "OFFLINE" ? "offline" : "unavailable"} />
      )}
      {state.status === "ok" && (
        <div className="flex flex-col gap-2">
          {state.data.slice(0, 8).map((item) => (
            <a
              key={item.id}
              href={item.url ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="grid grid-cols-[auto_auto_1fr] gap-x-3 font-mono text-micro"
            >
              <span className="text-term-graydim whitespace-nowrap">
                {new Date(item.publishedAt).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="text-term-cyan whitespace-nowrap truncate max-w-[70px]">{item.source}</span>
              <span className="text-term-white truncate">{item.headline}</span>
            </a>
          ))}
        </div>
      )}
    </Panel>
  );
}
