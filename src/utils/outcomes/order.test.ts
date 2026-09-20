import { describe, expect, it } from 'vitest'
import {
  buildOutcomeOrder,
  buildScaleOrders,
  feeMultiplierForScale,
  formatOutcomePrice,
  formatOutcomeSize,
  marketPriceWithSlippage,
  validateOutcomeOrder
} from './order'

describe('formatOutcomePrice', () => {
  it('keeps ≤5 decimals and 5 significant figures, strips trailing zeros', () => {
    expect(formatOutcomePrice(0.42)).toBe('0.42')
    expect(formatOutcomePrice(0.010935)).toBe('0.01094')
    expect(formatOutcomePrice(0.123456)).toBe('0.12346')
    expect(formatOutcomePrice(0.5)).toBe('0.5')
  })
  it('clamps to the tradable probability range', () => {
    expect(formatOutcomePrice(0)).toBe('0.001')
    expect(formatOutcomePrice(1.2)).toBe('0.999')
    expect(formatOutcomePrice(-1)).toBe('0.001')
  })
})

describe('formatOutcomeSize', () => {
  it('floors to whole shares', () => {
    expect(formatOutcomeSize(27.9)).toBe('27')
    expect(formatOutcomeSize(100)).toBe('100')
    expect(formatOutcomeSize(0.5)).toBe('')
    expect(formatOutcomeSize(NaN)).toBe('')
  })
})

describe('marketPriceWithSlippage', () => {
  it('applies slippage in the aggressive direction and clamps', () => {
    expect(marketPriceWithSlippage(0.5, true, 8)).toBeCloseTo(0.54)
    expect(marketPriceWithSlippage(0.5, false, 8)).toBeCloseTo(0.46)
    expect(marketPriceWithSlippage(0.98, true, 8)).toBe(0.999)
    expect(marketPriceWithSlippage(0.001, false, 8)).toBe(0.001)
  })
})

describe('validateOutcomeOrder', () => {
  it('enforces min notional, integer size, price bounds and balance', () => {
    expect(validateOutcomeOrder({ price: 0.42, size: 10, isBuy: true })).toMatchObject({
      ok: false,
      reason: 'Minimum order value is $10'
    })
    expect(validateOutcomeOrder({ price: 0.42, size: 27, isBuy: true })).toEqual({
      ok: true,
      price: '0.42',
      size: '27',
      notional: 0.42 * 27
    })
    expect(validateOutcomeOrder({ price: 1.5, size: 27, isBuy: true }).ok).toBe(false)
    expect(validateOutcomeOrder({ price: 0.42, size: 0.5, isBuy: true }).ok).toBe(false)
    expect(
      validateOutcomeOrder({ price: 0.42, size: 27, isBuy: true, available: 5 })
    ).toMatchObject({
      ok: false,
      reason: 'Insufficient balance'
    })
    expect(
      validateOutcomeOrder({ price: 0.42, size: 27, isBuy: false, available: 20 })
    ).toMatchObject({
      ok: false,
      reason: 'Insufficient shares'
    })
  })
})

describe('buildOutcomeOrder', () => {
  it('produces the exact wire shape with grouping-free limit type', () => {
    expect(
      buildOutcomeOrder({
        assetId: 100_012_100,
        isBuy: true,
        price: '0.42',
        size: '27',
        tif: 'Gtc'
      })
    ).toEqual({
      a: 100_012_100,
      b: true,
      p: '0.42',
      s: '27',
      r: false,
      t: { limit: { tif: 'Gtc' } }
    })
  })
})

describe('buildScaleOrders', () => {
  it('spreads whole shares across evenly spaced prices, remainder on the last', () => {
    const orders = buildScaleOrders({ totalShares: 100, startPx: 0.4, endPx: 0.5, count: 3 })
    expect(orders.map((o) => o.price)).toEqual(['0.4', '0.45', '0.5'])
    expect(orders.map((o) => Number(o.size)).reduce((a, b) => a + b, 0)).toBe(100)
    expect(orders.map((o) => o.size)).toEqual(['33', '33', '34'])
  })
  it('weights later orders with skew', () => {
    const orders = buildScaleOrders({
      totalShares: 90,
      startPx: 0.4,
      endPx: 0.5,
      count: 3,
      skew: 2
    })
    expect(orders.map((o) => Number(o.size))).toEqual([20, 30, 40])
  })
  it('drops zero-size legs and handles a single order', () => {
    expect(buildScaleOrders({ totalShares: 2, startPx: 0.4, endPx: 0.5, count: 5 })).toHaveLength(1)
    expect(buildScaleOrders({ totalShares: 5, startPx: 0.4, endPx: 0.5, count: 1 })).toEqual([
      { price: '0.4', size: '5' }
    ])
  })
})

describe('feeMultiplierForScale', () => {
  it('matches the HIP-4 formula scale + max(scale, 1)', () => {
    expect(feeMultiplierForScale(0)).toBe(1)
    expect(feeMultiplierForScale(1)).toBe(2)
    expect(feeMultiplierForScale(0.5)).toBe(1.5)
    expect(feeMultiplierForScale(3)).toBe(6)
  })
})
