import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import { TwapOrderRequest } from '@nktkas/hyperliquid/api/exchange'
import { normalizeDecimalString } from './decimalString'

describe('normalizeDecimalString', () => {
  it('leaves integers untouched (regression: "10" used to become "1")', () => {
    // Verified live on testnet 2026-09-19: a 10 SOL TWAP and a 10 SOL limit
    // order both went out as size "1" because the old regex stripped the zero.
    expect(normalizeDecimalString('10')).toBe('10')
    expect(normalizeDecimalString('100')).toBe('100')
    expect(normalizeDecimalString('1000000')).toBe('1000000')
    expect(normalizeDecimalString('30')).toBe('30') // PURR has szDecimals 0
  })

  it('strips trailing zeros from the fractional part only', () => {
    expect(normalizeDecimalString('1.2000')).toBe('1.2')
    expect(normalizeDecimalString('0.0020')).toBe('0.002')
    expect(normalizeDecimalString('1.10')).toBe('1.1')
    expect(normalizeDecimalString('20.50')).toBe('20.5')
  })

  it('removes a dangling decimal point', () => {
    expect(normalizeDecimalString('1.0')).toBe('1')
    expect(normalizeDecimalString('10.0')).toBe('10')
    expect(normalizeDecimalString('100.000')).toBe('100')
    expect(normalizeDecimalString('5.')).toBe('5')
  })

  it('collapses leading zeros and fills a missing integer part', () => {
    expect(normalizeDecimalString('00123')).toBe('123')
    expect(normalizeDecimalString('.5')).toBe('0.5')
    expect(normalizeDecimalString('0')).toBe('0')
    expect(normalizeDecimalString('0.0')).toBe('0')
    expect(normalizeDecimalString('-0.0')).toBe('0')
  })

  it('returns non-decimal input unchanged', () => {
    expect(normalizeDecimalString('')).toBe('')
    expect(normalizeDecimalString('.')).toBe('.')
    expect(normalizeDecimalString('1.0.0')).toBe('1.0.0')
    expect(normalizeDecimalString('abc')).toBe('abc')
  })

  it('agrees with what the @nktkas/hyperliquid twapOrder schema puts on the wire', () => {
    // The SDK's UnsignedDecimal schema normalizes `s` the same way right before
    // signing (Hyperliquid rejects trailing zeroes). The app must agree with it
    // so toasts, validation and the wire payload never diverge.
    const actionSchema = TwapOrderRequest.entries.action
    for (const raw of ['10', '100', '1.2000', '0.0020', '.5', '00123', '1.0', '30']) {
      const parsed = v.parse(actionSchema, {
        type: 'twapOrder',
        twap: { a: 0, b: true, s: raw, r: false, m: 5, t: false }
      })
      expect(normalizeDecimalString(raw)).toBe(parsed.twap.s)
    }
  })

  it('documents why the old inline regex was wrong', () => {
    const legacy = (s: string) => s.replace(/\.?0+$/, '')
    expect(legacy('10')).toBe('1') // the bug
    expect(normalizeDecimalString('10')).toBe('10') // the fix
  })
})
