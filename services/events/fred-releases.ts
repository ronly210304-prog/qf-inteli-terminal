import { EconomicEvent, EventImportance } from "@/types/event";

/**
 * FRED release-calendar adapter.
 *
 *   GET https://api.stlouisfed.org/fred/releases/dates
 *       ?api_key=...&file_type=json&include_release_dates_with_no_data=false
 *       &sort_order=asc&realtime_start=<today>
 *
 * FRED (St. Louis Fed) publishes real, official release dates for US
 * macro data (CPI, GDP, Employment Situation, FOMC statements, etc).
 * This is the actual live "when is the next X released" calendar —
 * dates are never invented.
 *
 * HONEST LIMITATION: FRED's release-dates endpoint gives a DATE, not a
 * time-of-day, and has no "importance" field. Converting a release name
 * into an approximate US Eastern release time and a 1–3 star importance
 * is a static, hand-maintained editorial mapping (RELEASE_META below) —
 * not something sourced live. The event NAME and DATE are real; the
 * TIME and IMPORTANCE are a fixed convention layered on top, disclosed
 * here and in the final implementation report. This is different from
 * spec section 17's forbidden case (hardcoding which events happen) —
 * we don't decide WHICH releases are coming, FRED does; we only label
 * the well-known ones with their usual clock time and priority.
 */

const FRED_RELEASES_BASE = "https://api.stlouisfed.org/fred/releases/dates";

interface ReleaseMeta {
  /** Substring match against FRED's release_name. */
  match: string;
  label: string;
  /** Typical US Eastern release time, 24h "HH:MM". */
  timeET: string;
  importance: EventImportance;
}

const RELEASE_META: ReleaseMeta[] = [
  { match: "Employment Situation", label: "NONFARM PAYROLLS (NFP)", timeET: "08:30", importance: 3 },
  { match: "Consumer Price Index", label: "CPI", timeET: "08:30", importance: 3 },
  { match: "Personal Income and Outlays", label: "PCE", timeET: "08:30", importance: 3 },
  { match: "Gross Domestic Product", label: "GDP", timeET: "08:30", importance: 3 },
  { match: "FOMC", label: "FOMC STATEMENT", timeET: "14:00", importance: 3 },
  { match: "Producer Price Index", label: "PPI", timeET: "08:30", importance: 2 },
  { match: "Retail Sales", label: "RETAIL SALES", timeET: "08:30", importance: 2 },
  { match: "Industrial Production", label: "INDUSTRIAL PRODUCTION", timeET: "09:15", importance: 1 },
  { match: "Consumer Sentiment", label: "CONSUMER SENTIMENT", timeET: "10:00", importance: 2 },
  { match: "Housing Starts", label: "HOUSING STARTS", timeET: "08:30", importance: 1 },
];

interface FredReleaseDatesResponse {
  release_dates: Array<{
    release_id: number;
    release_name: string;
    date: string; // YYYY-MM-DD
  }>;
}

function metaFor(releaseName: string): ReleaseMeta | null {
  return RELEASE_META.find((m) => releaseName.includes(m.match)) ?? null;
}

export async function getUpcomingUsEvents(maxEvents: number): Promise<EconomicEvent[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    throw new Error("FRED_API_KEY is not configured on the server");
  }

  const today = new Date().toISOString().slice(0, 10);
  const url = `${FRED_RELEASES_BASE}?api_key=${apiKey}&file_type=json&include_release_dates_with_no_data=false&sort_order=asc&realtime_start=${today}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`FRED releases/dates returned HTTP ${res.status}`);
  }

  const json = (await res.json()) as FredReleaseDatesResponse;
  const now = Date.now();

  const events: EconomicEvent[] = json.release_dates
    .map((rd) => {
      const meta = metaFor(rd.release_name);
      if (!meta) return null; // unlabeled release — skip rather than guess importance
      // Approximate ET as UTC-5 (ignores DST, which shifts this by up to 1h —
      // acceptable for a "next 3 events" list, disclosed in the report).
      const iso = `${rd.date}T${meta.timeET}:00-05:00`;
      const time = new Date(iso).getTime();
      if (isNaN(time) || time < now) return null;
      const event: EconomicEvent = {
        id: `${rd.release_id}-${rd.date}`,
        time: new Date(time).toISOString(),
        country: "US",
        title: meta.label,
        importance: meta.importance,
      };
      return event;
    })
    .filter((e): e is EconomicEvent => e !== null)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    .slice(0, maxEvents);

  if (events.length === 0) {
    throw new Error("No labeled upcoming releases found in FRED calendar window");
  }

  return events;
}
