import { describe, expect, it } from 'vitest'
import {
  calculateLiquidationPrice,
  formatPrice,
  getFormattedPrice,
  roundToSignificantFigures
} from './utils'

describe('roundToSignificantFigures (sanity)', () => {
  it('returns 0 for 0', () => {
    expect(roundToSignificantFigures(0)).toBe(0)
  })

  it('returns integers unchanged', () => {
    expect(roundToSignificantFigures(42)).toBe(42)
  })

  it('rounds a typical mid-cap price to 5 sig figs', () => {
    // 78,491.23456 -> 5 sig figs -> 78491
    expect(roundToSignificantFigures(78491.23456, 5)).toBe(78491)
  })

  it('rounds a small price to 5 sig figs', () => {
    // 0.0044319 -> 5 sig figs -> 0.0044319 (already 5 sf)
    // 0.00443198 -> 5 sig figs -> 0.0044320 (last digit rounds up)
    expect(roundToSignificantFigures(0.00443198, 5)).toBeCloseTo(0.004432, 10)
  })
})

/**
 * BUG-001 (Stage 3, test A):
 *
 * The QA screenshot shows liquidation price $104.52 for a SOL Long, 10x
 * Isolated, size 0.1, mark ~$102.55. A long can only be liquidated when
 * price falls, so a long's liq price must be strictly less than the entry
 * price it was computed against — no matter what leverage or margin mode.
 *
 * If this suite passes, the pure function is correct and the bug lives
 * upstream in MarketOrder.tsx (which feeds a slippage-inflated price as
 * `entryPrice`). If it fails, we've found a real bug in the pure fn.
 */
describe('calculateLiquidationPrice — directional sanity (BUG-001)', () => {
  it('long: liq price < entry price for the exact BUG-001 scenario (SOL isolated 10x)', () => {
    const entryPrice = 102.55
    const result = calculateLiquidationPrice({
      entryPrice,
      positionSize: 0.1,
      leverage: 10,
      isBuy: true,
      usdAmount: 10.255,
      isCross: false,
      maxLeverage: 10,
      crossAccountValue: 0
    })
    // Function returns a string like "96.85" or the literal "N/A"; parse it.
    expect(typeof result === 'string' || typeof result === 'number').toBe(true)
    const liq = Number(result)
    expect(Number.isFinite(liq)).toBe(true)
    expect(liq).toBeLessThan(entryPrice)
  })

  it('short: liq price > entry price for a mirror-image short', () => {
    const entryPrice = 102.55
    const result = calculateLiquidationPrice({
      entryPrice,
      positionSize: 0.1,
      leverage: 10,
      isBuy: false,
      usdAmount: 10.255,
      isCross: false,
      maxLeverage: 10,
      crossAccountValue: 0
    })
    const liq = Number(result)
    expect(Number.isFinite(liq)).toBe(true)
    expect(liq).toBeGreaterThan(entryPrice)
  })

  it('long: liq < entry across a spread of assets/leverages/sizes', () => {
    const cases = [
      { entryPrice: 78491, positionSize: 0.001, leverage: 10, maxLeverage: 40 }, // BTC
      { entryPrice: 2481, positionSize: 0.01, leverage: 5, maxLeverage: 25 }, // ETH
      { entryPrice: 102.55, positionSize: 1, leverage: 3, maxLeverage: 10 }, // SOL low lev
      { entryPrice: 0.81, positionSize: 100, leverage: 10, maxLeverage: 10 } // SUI max lev
    ]
    for (const c of cases) {
      const result = calculateLiquidationPrice({
        ...c,
        isBuy: true,
        usdAmount: c.entryPrice * c.positionSize,
        isCross: false,
        crossAccountValue: 0
      })
      const liq = Number(result)
      expect(Number.isFinite(liq), `long liq should be finite for ${JSON.stringify(c)}`).toBe(true)
      expect(liq, `long liq should be < entry for ${JSON.stringify(c)}`).toBeLessThan(c.entryPrice)
    }
  })
})

/**
 * BUG-023: price precision drift.
 *
 * Hyperliquid's tick-size rule (docs: /for-developers/api/tick-and-lot-size)
 * says prices have at most 5 significant figures AND at most
 * MAX_DECIMALS - szDecimals decimal places, whichever is stricter.
 *
 * The codebase has two supposedly-equivalent price formatters:
 *   - formatPrice(price, szDecimals, isSpot) -> number
 *   - getFormattedPrice({ price, szDecimals, isSpot }) -> string
 *
 * They must agree on the final numeric value. Today getFormattedPrice
 * truncates trailing digits instead of rounding (string-slice vs
 * Math.round), producing prices that differ from formatPrice by one tick
 * — a silent misdisplay in whichever cell uses the wrong helper.
 */
describe('getFormattedPrice — sig-figs & tick rounding (BUG-023)', () => {
  it('rounds a SOL-shaped price with 6 sig figs down to 5 (round-half-up)', () => {
    // 102.505 -> 5 sig figs -> 102.51 (banker/half-up rounding, same as formatPrice)
    expect(getFormattedPrice({ price: 102.505, isSpot: false, szDecimals: 2 })).toBe('102.51')
  })

  it('rounds a BTC-shaped 6-sig-fig price up to 5 sig figs', () => {
    // 78491.7 -> 5 sig figs -> 78492 (not 78491)
    expect(getFormattedPrice({ price: 78491.7, isSpot: false, szDecimals: 5 })).toBe('78492')
  })

  it('never disagrees with formatPrice() on the final numeric value', () => {
    // Both helpers claim to implement the same Hyperliquid tick rule; if they
    // disagree, users see different prices in different cells for the same input.
    const cases: Array<{ price: number; szDecimals: number; isSpot: boolean }> = [
      { price: 102.505, szDecimals: 2, isSpot: false }, // SOL, half-tick
      { price: 78491.7, szDecimals: 5, isSpot: false }, // BTC, 6 sig figs
      { price: 2481.05, szDecimals: 4, isSpot: false }, // ETH
      { price: 0.81215, szDecimals: 1, isSpot: false }, // SUI, tiny
      { price: 45, szDecimals: 2, isSpot: true }, // HYPE spot, integer
      { price: 0.004432, szDecimals: 0, isSpot: false } // PUMP-shaped
    ]
    for (const c of cases) {
      const str = getFormattedPrice(c)
      const num = formatPrice(c.price, c.szDecimals, c.isSpot)
      expect(
        Number(str),
        `getFormattedPrice returned "${str}" (=${Number(str)}) but formatPrice returned ${num} for ${JSON.stringify(c)}`
      ).toBe(num)
    }
  })
})
