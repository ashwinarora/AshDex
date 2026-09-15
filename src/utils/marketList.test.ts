import { describe, expect, it } from 'vitest'
import type { MetaResponse } from '@nktkas/hyperliquid/api/info'
import type { AssetCtxsEvent } from '@nktkas/hyperliquid/api/subscription'
import realMeta from '../../e2e/fixtures/rest.meta.json'
import realMetaAndCtxs from '../../e2e/fixtures/rest.metaAndAssetCtxs.json'
import { derivePerpsMarketList } from './marketList'

// The metaAndAssetCtxs fixture is a tuple [meta, ctxs] — pull them apart.
const [metaFromCombined, ctxs] = realMetaAndCtxs as unknown as [
  MetaResponse,
  AssetCtxsEvent['ctxs']
]
// Sanity: both meta captures should describe the same universe length.
if (metaFromCombined.universe.length !== (realMeta as MetaResponse).universe.length) {
  throw new Error('Fixture meta and metaAndAssetCtxs disagree on universe length; re-capture.')
}
const meta = metaFromCombined

describe('derivePerpsMarketList — Group C (whitelist removal + isDelisted)', () => {
  it('BUG-003: returns every non-delisted asset (not just a curated 9)', () => {
    const rows = derivePerpsMarketList(meta.universe, ctxs)
    const activeCount = meta.universe.filter((u) => !u.isDelisted).length
    expect(rows.length).toBe(activeCount)
    // Sanity check the number is comfortably above the old whitelist's 9.
    expect(rows.length).toBeGreaterThan(50)
  })

  it('BUG-002: excludes delisted assets (IP, ZEC and any other isDelisted)', () => {
    const rows = derivePerpsMarketList(meta.universe, ctxs)
    const delistedNames = new Set(meta.universe.filter((u) => u.isDelisted).map((u) => u.name))
    // Should hit at least IP and ZEC in the testnet capture.
    expect(delistedNames.has('IP')).toBe(true)
    expect(delistedNames.has('ZEC')).toBe(true)
    for (const row of rows) {
      expect(delistedNames.has(row.symbol)).toBe(false)
    }
  })

  it('searchTerm filters case-insensitively by symbol substring', () => {
    const rows = derivePerpsMarketList(meta.universe, ctxs, { searchTerm: 'btc' })
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      expect(row.symbol.toLowerCase()).toContain('btc')
    }
  })

  it('favoritesOnly=true returns only favorited symbols', () => {
    const rows = derivePerpsMarketList(meta.universe, ctxs, {
      favoritesOnly: true,
      favorites: new Set(['BTC', 'ETH'])
    })
    const symbols = rows.map((r) => r.symbol).sort()
    expect(symbols).toEqual(['BTC', 'ETH'])
  })
})
