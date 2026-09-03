export interface NewsItem {
  id: string;
  /** ISO 8601 publish time. */
  publishedAt: string;
  source: string;
  headline: string;
  url: string | null;
}
