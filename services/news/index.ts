import { DataState } from "@/types/market";
import { NewsItem } from "@/types/news";
import { cacheGet, cacheSet, TTL } from "@/lib/cache";
import { getYahooNews } from "./yahoo-rss";

export async function getNews(tickers: string[]): Promise<DataState<NewsItem[]>> {
  const cacheKey = `news:${tickers.join(",")}`;
  const cached = cacheGet<NewsItem[]>(cacheKey);
  if (cached) return { status: "ok", data: cached };

  try {
    const items = await getYahooNews(tickers);
    cacheSet(cacheKey, items, TTL.news);
    return { status: "ok", data: items };
  } catch (err) {
    return {
      status: "unavailable",
      reason: err instanceof Error ? err.message : "Unknown error fetching news",
    };
  }
}
