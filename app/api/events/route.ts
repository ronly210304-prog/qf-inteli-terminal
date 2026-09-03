import { NextResponse } from "next/server";
import { getUpcomingEvents } from "@/services/events";
import { MAX_UPCOMING_EVENTS } from "@/lib/constants";

export const dynamic = "force-dynamic";

/** GET /api/events */
export async function GET() {
  const result = await getUpcomingEvents(MAX_UPCOMING_EVENTS);
  return NextResponse.json(result);
}
