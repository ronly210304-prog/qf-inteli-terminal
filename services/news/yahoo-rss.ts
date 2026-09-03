import { NewsItem } from "@/types/news";

/**
 * Yahoo Finance company/industry news RSS feed adapter.
 *
 *   GET http://finance.yahoo.com/rss/headline?s=TICKER1,TICKER2
 *
 * This is a real, documented Yahoo Finance Web Services RSS 2.0 feed
 * (not HTML scraping) — headline, link, pubDate and source per item.
 * Per Yahoo's own documentation this feed is "limited to non-commercial
 * use only", which matches this project's brief (a personal terminal).
 * A commercial deployment of this app would need a licensed news API
 * instead — see the final implementation report.
 *
 * No full article text is ever fetched or stored — only the headline,
 * publish time, source name, and a link back to the original article.
 */

const RSS_BASE = "https://finance.yahoo.com/rss/headline";

function decodeXmlEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractTag(itemXml: string, tag: string): string | null {
  const match = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeXmlEntities(match[1]) : null;
}

function extractSourceAttr(itemXml: string): string | null {
  // <source url="https://...">Bloomberg</source>
  const match = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
  return match ? decodeXmlEntities(match[1]) : null;
}

/** Minimal, dependency-free RSS 2.0 item parser — good enough for this one feed shape. */
function parseRssItems(xml: string): NewsItem[] {
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  const items: NewsItem[] = [];

  for (const block of itemBlocks) {
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate");
    const source = extractSourceAttr(block) ?? "Yahoo Finance";

    if (!title || !pubDate) continue; // incomplete item — skip rather than guess

    const parsedDate = new Date(pubDate);
    items.push({
      id: link ?? `${title}-${pubDate}`,
      publishedAt: isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString(),
      source,
      headline: title,
      url: link,
    });
  }

  return items;
}

export async function getYahooNews(tickers: string[]): Promise<NewsItem[]> {
  if (tickers.length === 0) {
    throw new Error("No tickers configured for news lookup");
  }
  const url = `${RSS_BASE}?s=${tickers.map(encodeURIComponent).join(",")}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Yahoo RSS feed returned HTTP ${res.status}`);
  }

  const xml = await res.text();
  const items = parseRssItems(xml);

  if (items.length === 0) {
    throw new Error("Yahoo RSS feed returned no parsable items");
  }

  // Newest first, per spec.
  return items.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
