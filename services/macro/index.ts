import { DataState } from "@/types/market";
import { MacroDataPoint } from "@/types/macro";
import { cacheGet, cacheSet, TTL } from "@/lib/cache";
import { getFredLatest, MACRO_SERIES } from "./fred";

/**
 * Fetches all configured macro indicators independently — one FRED
 * series failing (or a missing API key) never blocks the others.
 * Each entry resolves to its own DataState.
 */
export async function getMacroSnapshot(
  indicatorIds: string[]
): Promise<Record<string, DataState<MacroDataPoint>>> {
  const entries = await Promise.all(
    indicatorIds.map(async (id) => {
      const cacheKey = `macro:${id}`;
      const cached = cacheGet<MacroDataPoint>(cacheKey);
      if (cached) return [id, { status: "ok", data: cached } as DataState<MacroDataPoint>] as const;

      try {
        const point = await getFredLatest(id);
        cacheSet(cacheKey, point, TTL.macro);
        return [id, { status: "ok", data: point } as DataState<MacroDataPoint>] as const;
      } catch (err) {
        return [
          id,
          {
            status: "unavailable",
            reason: err instanceof Error ? err.message : "Unknown error",
          } as DataState<MacroDataPoint>,
        ] as const;
      }
    })
  );
  return Object.fromEntries(entries);
}

export { MACRO_SERIES };
