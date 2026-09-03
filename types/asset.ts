/**
 * Generic asset configuration.
 *
 * Every tradable/observable instrument in the terminal (NQ, NDX, QQQ,
 * BTCUSD, ...) is described by one of these. Adding a new asset means
 * adding one config object, not new UI code.
 *
 * NOTE: no live values live on this type. This describes what an asset
 * IS, not its current price. Current price/quote data comes from the
 * market data service (see /services/market) once a provider is wired
 * up in a later step.
 */

export type AssetType = "future" | "index" | "etf" | "crypto" | "fx" | "commodity" | "rate";

export interface AssetConfig {
  /** Exchange/ticker symbol as used by the data provider, e.g. "NQ=F" */
  symbol: string;

  /** Broad category. Distinguishes e.g. NQ (future) from NDX (index) from QQQ (etf). */
  assetType: AssetType;

  /** Human-readable label shown in the UI, e.g. "NQ / NASDAQ-100" */
  displayName: string;

  /** Short label for compact spaces (header chip, tables), e.g. "NQ" */
  shortLabel: string;

  /**
   * Which provider adapter is responsible for this asset's price data.
   * This is an identifier the market service resolves to an adapter —
   * no provider is implemented yet as of STEP 1.
   */
  priceProvider: string | null;

  /** Keywords used to filter/prioritize news relevant to this asset. */
  newsKeywords: string[];

  /** Related market symbols to display alongside this asset (e.g. VIX, DXY for NQ). */
  relatedMarkets: string[];

  /** Macro indicators relevant to this asset's category. */
  macroRelevance: string[];

  /** Whether this asset is active/selectable yet. Assets without a working data source stay inactive. */
  isActive: boolean;
}
