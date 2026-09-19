import { describe, expect, it } from 'vitest'
import {
  TWAP_MAX_MINUTES,
  TWAP_MIN_MINUTES,
  TWAP_MIN_NOTIONAL_USDC,
  isValidDuration,
  meetsMinNotional,
  minutesFromDHM,
  suborderCount,
  suborderSize,
  triggerDirection
} from './twap'

describe('minutesFromDHM', () => {
  it('composes days, hours, minutes into total minutes', () => {
    expect(minutesFromDHM(0, 0, 5)).toBe(5)
    expect(minutesFromDHM(0, 1, 0)).toBe(60)
    expect(minutesFromDHM(1, 0, 0)).toBe(1440)
    expect(minutesFromDHM(0, 2, 30)).toBe(150)
    expect(minutesFromDHM(1, 1, 1)).toBe(1440 + 60 + 1)
  })

  it('coerces NaN / negative / empty inputs to zero', () => {
    expect(minutesFromDHM(NaN, 1, 0)).toBe(60)
    expect(minutesFromDHM(0, -3, 15)).toBe(15)
  })

  it('floors fractional inputs', () => {
    expect(minutesFromDHM(0, 0, 5.9)).toBe(5)
    expect(minutesFromDHM(0, 1.5, 0)).toBe(60)
  })
})

describe('isValidDuration', () => {
  it('accepts values in the TWAP_MIN_MINUTES..TWAP_MAX_MINUTES range', () => {
    // Range is TWAP_MIN_MINUTES (5) to TWAP_MAX_MINUTES (10080 min = 7 d),
    // matching what Hyperliquid's server accepts after the SDK schema patch.
    expect(isValidDuration(TWAP_MIN_MINUTES)).toBe(true)
    expect(isValidDuration(TWAP_MAX_MINUTES)).toBe(true)
    expect(isValidDuration(60)).toBe(true)
  })

  it('rejects out-of-range values', () => {
    expect(isValidDuration(0)).toBe(false)
    expect(isValidDuration(4)).toBe(false)
    expect(isValidDuration(TWAP_MAX_MINUTES + 1)).toBe(false)
    expect(isValidDuration(Number.NaN)).toBe(false)
  })
})

describe('suborderCount', () => {
  it('matches Hyperliquid UI approximation (0.002 BTC / 5m → 11 suborders)', () => {
    // Hyperliquid displayed ~0.00018 BTC per suborder for 0.002 total over 5m.
    // 0.002 / 11 ≈ 0.000181818, which rounds to 0.00018.
    expect(suborderCount(5)).toBe(11)
  })

  it('scales with duration', () => {
    expect(suborderCount(60)).toBe(121) // 1h
    // TWAP_MAX_MINUTES = 10080 (7d). 10080 × 60 / 30 + 1 = 20161.
    expect(suborderCount(TWAP_MAX_MINUTES)).toBe(20161)
  })

  it('returns 1 for invalid input to avoid divide-by-zero', () => {
    expect(suborderCount(0)).toBe(1)
    expect(suborderCount(Number.NaN)).toBe(1)
  })
})

describe('suborderSize', () => {
  it('divides total size by suborder count', () => {
    expect(suborderSize(0.002, 5)).toBeCloseTo(0.002 / 11)
    expect(suborderSize(25, 5)).toBeCloseTo(25 / 11)
  })

  it('returns 0 for empty size', () => {
    expect(suborderSize(0, 5)).toBe(0)
    expect(suborderSize(Number.NaN, 5)).toBe(0)
  })
})

describe('meetsMinNotional', () => {
  it('passes at exactly $100', () => {
    expect(meetsMinNotional(1, 100)).toBe(true)
  })

  it('passes above $100', () => {
    expect(meetsMinNotional(0.002, 81000)).toBe(true) // ~$162
  })

  it('fails below $100', () => {
    expect(meetsMinNotional(0.0007, 81000)).toBe(false) // ~$57 — verified failure toast on testnet
  })

  it('fails on non-finite inputs', () => {
    expect(meetsMinNotional(Number.NaN, 100)).toBe(false)
    expect(meetsMinNotional(1, Number.NaN)).toBe(false)
  })

  it('threshold is 100 USDC', () => {
    expect(TWAP_MIN_NOTIONAL_USDC).toBe(100)
  })
})

describe('triggerDirection', () => {
  it('returns true when trigger is above mark (buy breakout / sell breakout above)', () => {
    // Verified on testnet: Buy 82000 vs mark 81342 → wire t.a = true, UI label "(Above)"
    expect(triggerDirection(82000, 81342)).toBe(true)
  })

  it('returns false when trigger is below mark (sell breakdown / buy on dip)', () => {
    // Verified on testnet: Sell 80000 vs mark 81318 → wire t.a = false, UI label "(Below)"
    expect(triggerDirection(80000, 81318)).toBe(false)
  })

  it('returns false when trigger equals mark (not strictly above)', () => {
    expect(triggerDirection(81000, 81000)).toBe(false)
  })
})
