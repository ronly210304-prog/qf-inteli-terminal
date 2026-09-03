import { ReactNode } from "react";
import { cx } from "@/lib/utils";

interface PanelProps {
  children: ReactNode;
  className?: string;
  /** Removes the default padding, for panels that manage their own inner spacing (e.g. the chart). */
  noPadding?: boolean;
}

/**
 * Base panel: hairline border, flat background, no shadow, no rounded corners.
 * This is the single visual building block every terminal section sits inside —
 * deliberately plain so density and data carry the design, not chrome.
 */
export function Panel({ children, className, noPadding }: PanelProps) {
  return (
    <section
      className={cx(
        "border border-term-border bg-term-panel",
        !noPadding && "p-2.5",
        className
      )}
    >
      {children}
    </section>
  );
}
