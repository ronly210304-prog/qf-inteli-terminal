import { DataState } from "@/types/market";

/**
 * Client-side fetch wrapper that always resolves to a DataState —
 * panels never have to handle a thrown exception themselves, and a
 * network failure while offline is reported as "offline" (per spec's
 * OFFLINE state) rather than a generic error.
 */
export async function fetchDataState<T>(url: string): Promise<DataState<T>> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { status: "error", message: `Request failed (${res.status})` };
    }
    const json = (await res.json()) as DataState<T>;
    return json;
  } catch {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return { status: "error", message: "OFFLINE" };
    }
    return { status: "error", message: "Network request failed" };
  }
}
