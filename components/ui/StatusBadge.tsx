import { cx } from "@/lib/utils";

export type StatusKind = "loading" | "unavailable" | "na" | "error" | "offline";

const LABELS: Record<StatusKind, string> = {
  loading: "LOADING",
  unavailable: "NO DATA",
  na: "N/A",
  error: "ERROR",
  offline: "OFFLINE",
};

const COLORS: Record<StatusKind, string> = {
  loading: "text-term-gray",
  unavailable: "text-term-graydim",
  na: "text-term-graydim",
  error: "text-term-red",
  offline: "text-term-orange",
};

interface StatusBadgeProps {
  kind: StatusKind;
  /** Optional detail, e.g. an error message. Kept short — this is a dense terminal, not a toast. */
  detail?: string;
}

/**
 * Renders the terminal's empty/unavailable/loading states.
 * This is the ONLY component allowed to stand in for missing data —
 * no panel should ever render a plausible-looking placeholder number.
 */
export function StatusBadge({ kind, detail }: StatusBadgeProps) {
  return (
    <div className={cx("font-mono text-term text-center py-4", COLORS[kind])}>
      {LABELS[kind]}
      {detail && <span className="block text-micro mt-1 text-term-graydim">{detail}</span>}
    </div>
  );
}
