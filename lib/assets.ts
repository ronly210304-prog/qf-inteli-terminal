import { AssetConfig } from "@/types/asset";

/**
 * Asset registry — the single source of truth for every instrument the
 * terminal knows about, and which are ACTIVE (selectable).
 *
 * "Active" means the same provider path already trusted for NQ/NDX/QQQ
 * (Yahoo's chart endpoint, query1.finance.yahoo.com/v8/finance/chart)
 * is expected to cover it — Yahoo's endpoint is documented to cover
 * "US stocks, ETFs, mutual funds, indices, crypto, and many
 * international exchanges" from one unauthenticated source. This is
 * therefore now a BROAD activation across every major free-data
 * category (index, ETF, future, FX, commodity, crypto, rate), not
 * just the original NQ family.
 *
 * HONEST LIMITATION: individual symbols below were not each hand-
 * verified against a live Yahoo response in this session (no network
 * access in the build sandbox — see the implementation report). They
 * follow the exact same request shape already relied on for NQ=F/
 * ^NDX/QQQ, so they are expected to work, but confirm locally after
 * `npm run dev` and flag any symbol that 404s so it can be deactivated
 * rather than left silently broken.
 *
 * newsKeywords deliberately differ from `symbol` in several rows: Yahoo's
 * classic RSS news feed (finance.yahoo.com/rss/headline?s=...) is a
 * per-ticker feed, not free-text search, and behaves best with plain
 * equity/ETF tickers. For futures, FX pairs, and indices that may not
 * carry their own news feed, a liquid, heavily-covered ETF proxy is
 * used instead (e.g. GLD for gold, UUP for the Dollar Index) — this is
 * disclosed here and in services/news so it's never mistaken for the
 * priced instrument itself.
 */
export const ASSET_CONFIGS: AssetConfig[] = [
  // ---- NASDAQ-100 family ----
  {
    symbol: "NQ=F",
    assetType: "future",
    displayName: "NQ / NASDAQ-100 FUTURES",
    shortLabel: "NQ",
    priceProvider: "yahoo",
    newsKeywords: ["^NDX", "QQQ"],
    relatedMarkets: ["^GSPC", "^DJI", "^VIX", "DX-Y.NYB", "^TNX", "GC=F", "BTC-USD"],
    macroRelevance: ["fedfunds", "cpi", "pce", "gdp", "unemployment", "m2"],
    isActive: true,
  },
  {
    symbol: "^NDX",
    assetType: "index",
    displayName: "NDX / NASDAQ-100 INDEX",
    shortLabel: "NDX",
    priceProvider: "yahoo",
    newsKeywords: ["^NDX", "QQQ"],
    relatedMarkets: ["^GSPC", "^DJI", "^VIX", "DX-Y.NYB", "^TNX", "GC=F", "BTC-USD"],
    macroRelevance: ["fedfunds", "cpi", "pce", "gdp", "unemployment", "m2"],
    isActive: true,
  },
  {
    symbol: "QQQ",
    assetType: "etf",
    displayName: "QQQ / INVESCO NASDAQ-100 ETF",
    shortLabel: "QQQ",
    priceProvider: "yahoo",
    newsKeywords: ["QQQ", "^NDX"],
    relatedMarkets: ["^GSPC", "^DJI", "^VIX", "DX-Y.NYB", "^TNX", "GC=F", "BTC-USD"],
    macroRelevance: ["fedfunds", "cpi", "pce", "gdp", "unemployment", "m2"],
    isActive: true,
  },

  // ---- S&P 500 family ----
  {
    symbol: "^GSPC",
    assetType: "index",
    displayName: "SPX / S&P 500 INDEX",
    shortLabel: "SPX",
    priceProvider: "yahoo",
    newsKeywords: ["SPY", "^GSPC"],
    relatedMarkets: ["^NDX", "^DJI", "^VIX", "DX-Y.NYB", "^TNX", "GC=F"],
    macroRelevance: ["fedfunds", "cpi", "pce", "gdp", "unemployment", "m2"],
    isActive: true,
  },
  {
    symbol: "SPY",
    assetType: "etf",
    displayName: "SPY / SPDR S&P 500 ETF",
    shortLabel: "SPY",
    priceProvider: "yahoo",
    newsKeywords: ["SPY", "^GSPC"],
    relatedMarkets: ["^NDX", "^DJI", "^VIX", "DX-Y.NYB", "^TNX", "GC=F"],
    macroRelevance: ["fedfunds", "cpi", "pce", "gdp", "unemployment", "m2"],
    isActive: true,
  },
  {
    symbol: "ES=F",
    assetType: "future",
    displayName: "ES / S&P 500 FUTURES",
    shortLabel: "ES",
    priceProvider: "yahoo",
    newsKeywords: ["SPY", "^GSPC"],
    relatedMarkets: ["^NDX", "^DJI", "^VIX", "DX-Y.NYB", "^TNX"],
    macroRelevance: ["fedfunds", "cpi", "pce", "gdp", "unemployment", "m2"],
    isActive: true,
  },

  // ---- Dow Jones family ----
  {
    symbol: "^DJI",
    assetType: "index",
    displayName: "DOW / DOW JONES INDUSTRIAL AVERAGE",
    shortLabel: "DOW",
    priceProvider: "yahoo",
    newsKeywords: ["DIA", "^DJI"],
    relatedMarkets: ["^GSPC", "^NDX", "^VIX", "DX-Y.NYB", "^TNX"],
    macroRelevance: ["fedfunds", "cpi", "pce", "gdp", "unemployment", "m2"],
    isActive: true,
  },
  {
    symbol: "DIA",
    assetType: "etf",
    displayName: "DIA / SPDR DOW JONES ETF",
    shortLabel: "DIA",
    priceProvider: "yahoo",
    newsKeywords: ["DIA", "^DJI"],
    relatedMarkets: ["^GSPC", "^NDX", "^VIX", "DX-Y.NYB", "^TNX"],
    macroRelevance: ["fedfunds", "cpi", "pce", "gdp", "unemployment", "m2"],
    isActive: true,
  },
  {
    symbol: "YM=F",
    assetType: "future",
    displayName: "YM / DOW FUTURES",
    shortLabel: "YM",
    priceProvider: "yahoo",
    newsKeywords: ["DIA", "^DJI"],
    relatedMarkets: ["^GSPC", "^NDX", "^VIX", "DX-Y.NYB", "^TNX"],
    macroRelevance: ["fedfunds", "cpi", "pce", "gdp", "unemployment", "m2"],
    isActive: true,
  },

  // ---- Russell 2000 (small-cap) ----
  {
    symbol: "^RUT",
    assetType: "index",
    displayName: "RUT / RUSSELL 2000 INDEX",
    shortLabel: "RUT",
    priceProvider: "yahoo",
    newsKeywords: ["IWM", "^RUT"],
    relatedMarkets: ["^GSPC", "^NDX", "^VIX", "DX-Y.NYB", "^TNX"],
    macroRelevance: ["fedfunds", "cpi", "gdp", "unemployment"],
    isActive: true,
  },
  {
    symbol: "IWM",
    assetType: "etf",
    displayName: "IWM / RUSSELL 2000 ETF",
    shortLabel: "IWM",
    priceProvider: "yahoo",
    newsKeywords: ["IWM", "^RUT"],
    relatedMarkets: ["^GSPC", "^NDX", "^VIX", "DX-Y.NYB", "^TNX"],
    macroRelevance: ["fedfunds", "cpi", "gdp", "unemployment"],
    isActive: true,
  },

  // ---- Crypto ----
  {
    symbol: "BTC-USD",
    assetType: "crypto",
    displayName: "BTC / BITCOIN USD",
    shortLabel: "BTC",
    priceProvider: "yahoo",
    newsKeywords: ["BTC-USD", "bitcoin"],
    relatedMarkets: ["^GSPC", "^VIX", "DX-Y.NYB", "ETH-USD", "GC=F"],
    macroRelevance: ["fedfunds", "cpi", "m2"],
    isActive: true,
  },
  {
    symbol: "ETH-USD",
    assetType: "crypto",
    displayName: "ETH / ETHEREUM USD",
    shortLabel: "ETH",
    priceProvider: "yahoo",
    newsKeywords: ["ETH-USD", "ethereum"],
    relatedMarkets: ["BTC-USD", "^GSPC", "^VIX"],
    macroRelevance: ["fedfunds", "m2"],
    isActive: true,
  },

  // ---- Commodities (futures priced; news via liquid ETF proxy) ----
  {
    symbol: "GC=F",
    assetType: "commodity",
    displayName: "GOLD / GOLD FUTURES",
    shortLabel: "GOLD",
    priceProvider: "yahoo",
    newsKeywords: ["GLD"],
    relatedMarkets: ["DX-Y.NYB", "^TNX", "SI=F"],
    macroRelevance: ["fedfunds", "cpi"],
    isActive: true,
  },
  {
    symbol: "SI=F",
    assetType: "commodity",
    displayName: "SILVER / SILVER FUTURES",
    shortLabel: "SILVER",
    priceProvider: "yahoo",
    newsKeywords: ["SLV"],
    relatedMarkets: ["GC=F", "DX-Y.NYB"],
    macroRelevance: ["fedfunds", "cpi"],
    isActive: true,
  },
  {
    symbol: "CL=F",
    assetType: "commodity",
    displayName: "WTI / CRUDE OIL FUTURES",
    shortLabel: "WTI",
    priceProvider: "yahoo",
    newsKeywords: ["USO"],
    relatedMarkets: ["DX-Y.NYB", "^GSPC"],
    macroRelevance: ["cpi", "gdp"],
    isActive: true,
  },
  {
    symbol: "NG=F",
    assetType: "commodity",
    displayName: "NATGAS / NATURAL GAS FUTURES",
    shortLabel: "NATGAS",
    priceProvider: "yahoo",
    newsKeywords: ["UNG"],
    relatedMarkets: ["CL=F", "DX-Y.NYB"],
    macroRelevance: ["cpi"],
    isActive: true,
  },

  // ---- FX ----
  {
    symbol: "DX-Y.NYB",
    assetType: "fx",
    displayName: "DXY / US DOLLAR INDEX",
    shortLabel: "DXY",
    priceProvider: "yahoo",
    newsKeywords: ["UUP"],
    relatedMarkets: ["^TNX", "GC=F", "^GSPC"],
    macroRelevance: ["fedfunds", "cpi", "m2"],
    isActive: true,
  },
  {
    symbol: "EURUSD=X",
    assetType: "fx",
    displayName: "EUR/USD",
    shortLabel: "EURUSD",
    priceProvider: "yahoo",
    newsKeywords: ["FXE", "UUP"],
    relatedMarkets: ["DX-Y.NYB", "^TNX"],
    macroRelevance: ["fedfunds", "cpi"],
    isActive: true,
  },
  {
    symbol: "GBPUSD=X",
    assetType: "fx",
    displayName: "GBP/USD",
    shortLabel: "GBPUSD",
    priceProvider: "yahoo",
    newsKeywords: ["FXB", "UUP"],
    relatedMarkets: ["DX-Y.NYB", "^TNX"],
    macroRelevance: ["fedfunds", "cpi"],
    isActive: true,
  },
  {
    symbol: "USDJPY=X",
    assetType: "fx",
    displayName: "USD/JPY",
    shortLabel: "USDJPY",
    priceProvider: "yahoo",
    newsKeywords: ["FXY", "UUP"],
    relatedMarkets: ["DX-Y.NYB", "^TNX"],
    macroRelevance: ["fedfunds", "cpi"],
    isActive: true,
  },

  // ---- Volatility & rates ----
  {
    symbol: "^VIX",
    assetType: "index",
    displayName: "VIX / CBOE VOLATILITY INDEX",
    shortLabel: "VIX",
    priceProvider: "yahoo",
    newsKeywords: ["VIXY"],
    relatedMarkets: ["^GSPC", "^NDX", "DX-Y.NYB"],
    macroRelevance: ["fedfunds"],
    isActive: true,
  },
  {
    symbol: "^TNX",
    assetType: "rate",
    displayName: "US10Y / 10-YEAR TREASURY YIELD",
    shortLabel: "US10Y",
    priceProvider: "yahoo",
    newsKeywords: ["TLT"],
    relatedMarkets: ["DX-Y.NYB", "^GSPC", "GC=F"],
    macroRelevance: ["fedfunds", "cpi", "gdp"],
    isActive: true,
  },
];

export const DEFAULT_ASSET_SYMBOL = "NQ=F";

/**
 * Symbols with a real, free sentiment source (see services/sentiment).
 * Used both by the API service and by SentimentPanel so the panel can
 * hide itself entirely for assets with no source, instead of rendering
 * a permanent "NO DATA" box for something that structurally never
 * resolves.
 */
export const SENTIMENT_SUPPORTED_SYMBOLS = ["BTC-USD"];

export function getAssetConfig(symbol: string): AssetConfig | undefined {
  return ASSET_CONFIGS.find((a) => a.symbol === symbol);
}

export function getActiveAssets(): AssetConfig[] {
  return ASSET_CONFIGS.filter((a) => a.isActive);
}

/** Human labels for related-market symbols, for compact table display. */
export const RELATED_MARKET_LABELS: Record<string, string> = {
  "^GSPC": "S&P 500",
  "^DJI": "DOW",
  "^NDX": "NASDAQ-100",
  "^RUT": "RUSSELL 2K",
  "^VIX": "VIX",
  "^TNX": "US10Y",
  "DX-Y.NYB": "DXY",
  "GC=F": "GOLD",
  "SI=F": "SILVER",
  "CL=F": "WTI CRUDE",
  "NG=F": "NAT GAS",
  "BTC-USD": "BTC",
  "ETH-USD": "ETH",
  "SPY": "SPY",
  "DIA": "DIA",
  "IWM": "IWM",
  "QQQ": "QQQ",
  "ES=F": "S&P FUT",
  "YM=F": "DOW FUT",
  "EURUSD=X": "EUR/USD",
  "GBPUSD=X": "GBP/USD",
  "USDJPY=X": "USD/JPY",
};
