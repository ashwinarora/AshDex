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
