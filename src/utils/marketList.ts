import type { MetaResponse } from '@nktkas/hyperliquid/api/info'
import type { AssetCtxsEvent } from '@nktkas/hyperliquid/api/subscription'

export interface PerpAssetData {
  symbol: string
  price: number
  prevDayPrice: number
  volume: number
  openInterest: number
  maxLeverage: number
}

export interface DerivePerpsMarketListOpts {
  searchTerm?: string
  favoritesOnly?: boolean
  favorites?: Set<string>
}

/**
 * Derives the rendered perps market list from the raw Hyperliquid meta + WS
 * asset ctxs. Applies the display rules the app enforces at the boundary:
 *
 *   1. Drop delisted universes (`isDelisted`) — they render as $0.00 / -100%.
 *   2. Optional case-insensitive substring search on the symbol.
 *   3. Optional "favorites only" filter.
 *
 * NOT applied here: any hardcoded whitelist. The app shows whatever
 * Hyperliquid returns, so a delisting upstream immediately hides the row.
 *
 * Pure. Same inputs → same output. Safe to memoize.
 */
export function derivePerpsMarketList(
  universe: MetaResponse['universe'],
  assetCtxs: AssetCtxsEvent['ctxs'],
  opts: DerivePerpsMarketListOpts = {}
): PerpAssetData[] {
  const { searchTerm = '', favoritesOnly = false, favorites } = opts
  const term = searchTerm.toLowerCase()

  const rows: PerpAssetData[] = []
  for (let idx = 0; idx < universe.length; idx++) {
    const asset = universe[idx]
    if (asset.isDelisted) continue
    if (favoritesOnly && !(favorites?.has(asset.name) ?? false)) continue
    if (term && !asset.name.toLowerCase().includes(term)) continue

    const ctx = assetCtxs[idx]
    rows.push({
      symbol: asset.name,
      price: ctx?.midPx ? Number(ctx.midPx) : 0,
      prevDayPrice: ctx?.prevDayPx ? Number(ctx.prevDayPx) : 0,
      volume: ctx?.dayNtlVlm ? Number(ctx.dayNtlVlm) : 0,
      openInterest:
        ctx?.midPx && ctx?.openInterest ? Number(ctx.midPx) * Number(ctx.openInterest) : 0,
      maxLeverage: asset.maxLeverage || 1
    })
  }
  return rows
}
