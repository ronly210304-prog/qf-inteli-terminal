import { ReactNode } from "react";
import { cx } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  right?: ReactNode;
  className?: string;
}

/**
 * Terminal section label, e.g. "NEWS", "MACRO", "SENTIMENT".
 * Matches the section naming used throughout the spec's own reference
 * layout — this is terminal convention (Bloomberg/Reuters style dense
 * labeling), not a decorative eyebrow.
 */
export function SectionHeader({ title, right, className }: SectionHeaderProps) {
  return (
    <div
      className={cx(
        "flex items-center justify-between border-b border-term-borderdim pb-1.5 mb-2",
        className
      )}
    >
      <h2 className="text-micro font-mono tracking-wide text-term-gray">
        {title}
      </h2>
      {right && <div className="text-micro font-mono text-term-gray">{right}</div>}
    </div>
  );
}
