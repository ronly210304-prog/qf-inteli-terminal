"use client";

import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { INDICATOR_DEFINITIONS } from "@/lib/constants";
import { cx } from "@/lib/utils";
import { useTerminal } from "./TerminalProvider";

/**
 * Compact terminal-style indicator toggles (spec section 10):
 *   MA20 ●   MA60 ●   MA99 ●   BB ○   RSI ○   MACD ○
 *
 * State lives in TerminalProvider so ChartPanel can read the same
 * toggles and actually add/remove series (STEP 5).
 */
export function IndicatorControls() {
  const { indicators, toggleIndicator } = useTerminal();

  return (
    <Panel>
      <SectionHeader title="INDICATORS" />
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {INDICATOR_DEFINITIONS.map((def) => {
          const enabled = indicators[def.id];
          return (
            <button
              key={def.id}
              type="button"
              onClick={() => toggleIndicator(def.id)}
              className="flex items-center gap-1.5 font-mono text-micro"
              aria-pressed={enabled}
            >
              <span className={enabled ? "text-term-white" : "text-term-graydim"}>
                {def.label}
              </span>
              <span className={cx(enabled ? "text-term-green" : "text-term-graydim")}>
                {enabled ? "●" : "○"}
              </span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
