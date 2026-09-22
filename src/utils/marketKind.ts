import { isOutcomeCoin } from '@/utils/outcomes/encoding'

export type MarketKind = 'perp' | 'spot' | 'outcome'

/**
 * Classify a coin string the way Hyperliquid's user-scoped feeds spell it:
 *   `#123`            → outcome share (HIP-4)
 *   `@107` / `PURR/USDC` (in the spot universe) → spot
 *   anything else     → perp (validator or builder-deployed)
 * `spotKeyToName` is the universe-key → base-name map from `useSpotMeta`.
 */
export const getMarketKind = (coin: string, spotKeyToName: Map<string, string>): MarketKind => {
  if (isOutcomeCoin(coin)) return 'outcome'
  if (spotKeyToName.has(coin)) return 'spot'
  return 'perp'
}

/** Route → market kind. `/spot*` is spot, `/outcomes*` is outcome, everything else perp. */
export const marketKindFromPathname = (pathname: string | null | undefined): MarketKind => {
  if (!pathname) return 'perp'
  if (pathname.startsWith('/spot')) return 'spot'
  if (pathname.startsWith('/outcomes')) return 'outcome'
  return 'perp'
}
