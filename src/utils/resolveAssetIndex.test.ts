import { describe, expect, it } from 'vitest'
import { resolveAssetIndex } from './resolveAssetIndex'
import { SPOT_DELTA } from '@/utils/constants'

describe('resolveAssetIndex — perps', () => {
  const perpsUniverse = [{ name: 'SOL' }, { name: 'BTC' }, { name: 'ETH' }]

  it('returns 0 for the first perp asset (BUG-007 regression)', () => {
    // The bug: the old inline `!assetIndex || assetIndex < 0` gate threw
    // "Asset index not found" for index 0 because `!0 === true`. If this
    // returns null the fix regressed.
    expect(resolveAssetIndex('SOL', { isSpot: false, perpsUniverse })).toBe(0)
  })

  it('returns the correct index for later perp assets', () => {
    expect(resolveAssetIndex('BTC', { isSpot: false, perpsUniverse })).toBe(1)
    expect(resolveAssetIndex('ETH', { isSpot: false, perpsUniverse })).toBe(2)
  })

  it('returns null for a coin not in the perps universe', () => {
    expect(resolveAssetIndex('UNKNOWN', { isSpot: false, perpsUniverse })).toBe(null)
  })

  it('returns null when perpsUniverse is undefined', () => {
    expect(resolveAssetIndex('SOL', { isSpot: false })).toBe(null)
  })
})

describe('resolveAssetIndex — spot', () => {
  const spotUniverse = [
    { name: 'PURR/USDC', index: 0 },
    { name: 'HYPE/USDC', index: 1035 }
  ]

  it('adds SPOT_DELTA to the raw index for spot pairs', () => {
    expect(resolveAssetIndex('HYPE/USDC', { isSpot: true, spotUniverse })).toBe(1035 + SPOT_DELTA)
  })

  it('handles index 0 correctly with SPOT_DELTA (also the BUG-007 shape)', () => {
    expect(resolveAssetIndex('PURR/USDC', { isSpot: true, spotUniverse })).toBe(0 + SPOT_DELTA)
  })

  it('returns null for a coin not in the spot universe', () => {
    expect(resolveAssetIndex('BOGUS/USDC', { isSpot: true, spotUniverse })).toBe(null)
  })

  it('returns null when spotUniverse is undefined', () => {
    expect(resolveAssetIndex('PURR/USDC', { isSpot: true })).toBe(null)
  })
})

describe('resolveAssetIndex — outcomes (HIP-4)', () => {
  const perpsUniverse = [{ name: 'SOL' }]
  it('maps #enc coins to 100_000_000 + enc without a universe, on any route', () => {
    expect(resolveAssetIndex('#12100', { isSpot: false, perpsUniverse })).toBe(100_012_100)
    expect(resolveAssetIndex('#12100', { isSpot: true })).toBe(100_012_100)
    // Docs example: outcome 1, side 0 → encoding 10 → asset 100000010
    expect(resolveAssetIndex('#10', { isSpot: false })).toBe(100_000_010)
  })
  it('does not treat balance (+) or settled (o) spellings as orderable coins', () => {
    expect(resolveAssetIndex('+12100', { isSpot: false, perpsUniverse })).toBe(null)
    expect(resolveAssetIndex('o1210', { isSpot: false, perpsUniverse })).toBe(null)
  })
})
