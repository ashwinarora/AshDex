import { describe, expect, it } from 'vitest'
import {
  decodeOutcomeEncoding,
  encodeOutcomeSide,
  isOutcomeBalanceCoin,
  isOutcomeCoin,
  isSettledOutcomeBalanceCoin,
  oppositeSideCoin,
  parseOutcomeEncoding,
  toOutcomeAssetId,
  toOutcomeBalanceCoin,
  toOutcomeCoin
} from './encoding'

describe('outcome encoding', () => {
  it('encodes outcome + side the way the docs describe (10*outcome + side)', () => {
    expect(encodeOutcomeSide(1, 0)).toBe(10)
    expect(encodeOutcomeSide(1, 1)).toBe(11)
    expect(encodeOutcomeSide(1210, 0)).toBe(12100)
    expect(encodeOutcomeSide(4219, 1)).toBe(42191)
  })

  it('round-trips through decode', () => {
    expect(decodeOutcomeEncoding(12100)).toEqual({ outcome: 1210, side: 0 })
    expect(decodeOutcomeEncoding(42191)).toEqual({ outcome: 4219, side: 1 })
  })

  it('spells the same encoding for market data, balances and exchange asset ids', () => {
    expect(toOutcomeCoin(12100)).toBe('#12100')
    expect(toOutcomeBalanceCoin(12100)).toBe('+12100')
    // Docs example: outcome 1 side 0 → asset id 100000010
    expect(toOutcomeAssetId(encodeOutcomeSide(1, 0))).toBe(100_000_010)
  })

  it('parses every spelling and rejects non-outcome coins', () => {
    expect(parseOutcomeEncoding('#12100')).toBe(12100)
    expect(parseOutcomeEncoding('+12100')).toBe(12100)
    expect(parseOutcomeEncoding('12100')).toBe(12100)
    expect(parseOutcomeEncoding(12100)).toBe(12100)
    expect(parseOutcomeEncoding('BTC')).toBeNull()
    expect(parseOutcomeEncoding('@107')).toBeNull()
    expect(parseOutcomeEncoding('o1209')).toBeNull()
    expect(parseOutcomeEncoding(undefined)).toBeNull()
  })

  it('classifies coin spellings', () => {
    expect(isOutcomeCoin('#12100')).toBe(true)
    expect(isOutcomeCoin('+12100')).toBe(false)
    expect(isOutcomeCoin('@107')).toBe(false)
    expect(isOutcomeBalanceCoin('+12100')).toBe(true)
    expect(isOutcomeBalanceCoin('USDC')).toBe(false)
    expect(isSettledOutcomeBalanceCoin('o1209')).toBe(true)
    expect(isSettledOutcomeBalanceCoin('#1209')).toBe(false)
  })

  it('flips to the opposite side coin', () => {
    expect(oppositeSideCoin('#12100')).toBe('#12101')
    expect(oppositeSideCoin('#12101')).toBe('#12100')
    expect(oppositeSideCoin('BTC')).toBe('BTC')
  })
})
