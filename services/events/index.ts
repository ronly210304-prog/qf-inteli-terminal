import { DataState } from "@/types/market";
import { EconomicEvent } from "@/types/event";
import { cacheGet, cacheSet, TTL } from "@/lib/cache";
import { getUpcomingUsEvents } from "./fred-releases";

export async function getUpcomingEvents(maxEvents: number): Promise<DataState<EconomicEvent[]>> {
  const cacheKey = `events:${maxEvents}`;
  const cached = cacheGet<EconomicEvent[]>(cacheKey);
  if (cached) return { status: "ok", data: cached };

  try {
    const events = await getUpcomingUsEvents(maxEvents);
    cacheSet(cacheKey, events, TTL.events);
    return { status: "ok", data: events };
  } catch (err) {
    return {
      status: "unavailable",
      reason: err instanceof Error ? err.message : "Unknown error fetching events",
    };
  }
}
