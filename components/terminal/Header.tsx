"use client";

import { APP_NAME } from "@/lib/constants";
import { useTerminal } from "./TerminalProvider";

/**
 * Top header bar: app name + settings on one row, asset selector chip
 * below it at full width. Two rows keeps every element legible at the
 * narrowest target width (390px). Tapping the chip opens AssetSelector
 * (STEP 11). Settings has no destination yet and stays inert.
 */
export function Header() {
  const { asset, openSelector } = useTerminal();

  return (
    <header className="sticky top-0 z-10 border-b border-term-border bg-term-black px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-term font-medium tracking-wide text-term-white">
          {APP_NAME}
        </span>
        <button
          type="button"
          disabled
          className="flex h-[24px] w-[24px] shrink-0 items-center justify-center border border-term-border bg-term-charcoal text-term-gray disabled:cursor-default"
          aria-label="Settings, not yet interactive"
        >
          ⚙
        </button>
      </div>
      <button
        type="button"
        onClick={openSelector}
        className="mt-2 flex w-full items-center justify-between border border-term-border bg-term-charcoal px-2 py-1 font-mono text-micro text-term-white"
        aria-label="Open asset selector"
      >
        {asset.displayName}
        <span className="text-term-gray">▼</span>
      </button>
    </header>
  );
}
