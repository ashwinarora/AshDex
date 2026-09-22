import {
  OUTCOME_MAX_PX,
  OUTCOME_MIN_NOTIONAL_USD,
  OUTCOME_MIN_PX,
  OUTCOME_PX_DECIMALS,
  OUTCOME_SZ_DECIMALS
} from '@/utils/constants'
import { normalizeDecimalString } from '@/utils/decimalString'
import { roundToSignificantFigures } from '@/utils/utils'

/**
 * Pure order-shaping helpers for HIP-4 outcome shares. Kept free of React and
 * SDK clients so the exact wire values can be unit-tested.
 */

export type OutcomeTif = 'Gtc' | 'Ioc' | 'Alo'

export type OutcomeWireOrder = {
  a: number
  b: boolean
  p: string
  s: string
  r: false
  t: { limit: { tif: OutcomeTif } }
}

/** Clamp to [0.001, 0.999], 5 significant figures, at most 5 decimals, trailing zeros stripped. */
export const formatOutcomePrice = (px: number): string => {
  if (!Number.isFinite(px)) return ''
  const clamped = Math.min(OUTCOME_MAX_PX, Math.max(OUTCOME_MIN_PX, px))
  const sig = roundToSignificantFigures(clamped, 5)
  const fixed = Number(sig.toFixed(OUTCOME_PX_DECIMALS))
  return normalizeDecimalString(fixed.toFixed(OUTCOME_PX_DECIMALS))
}

/** Whole shares (floor) as a wire string; "" for nothing. */
export const formatOutcomeSize = (sz: number): string => {
  if (!Number.isFinite(sz) || sz <= 0) return ''
  const factor = 10 ** OUTCOME_SZ_DECIMALS
  const floored = Math.floor(sz * factor) / factor
  if (floored <= 0) return ''
  return normalizeDecimalString(floored.toFixed(OUTCOME_SZ_DECIMALS))
}

/** Aggressive limit used for "market" (IOC) orders: mid ± slippage, clamped. */
export const marketPriceWithSlippage = (
  mid: number,
  isBuy: boolean,
  slippagePct: number
): number => {
  const mult = isBuy ? 1 + slippagePct / 100 : 1 - slippagePct / 100
  return Math.min(OUTCOME_MAX_PX, Math.max(OUTCOME_MIN_PX, mid * mult))
}

export type OutcomeOrderValidation =
  | { ok: true; price: string; size: string; notional: number }
  | { ok: false; reason: string }

export const validateOutcomeOrder = ({
  price,
  size,
  available,
  isBuy
}: {
  price: number
  size: number
  /** Quote available when buying, shares available when selling. */
  available?: number
  isBuy: boolean
}): OutcomeOrderValidation => {
  if (!Number.isFinite(price) || price <= 0) return { ok: false, reason: 'Enter a price' }
  if (price < OUTCOME_MIN_PX || price > OUTCOME_MAX_PX)
    return { ok: false, reason: `Price must be between ${OUTCOME_MIN_PX} and ${OUTCOME_MAX_PX}` }
  const s = formatOutcomeSize(size)
  if (!s) return { ok: false, reason: 'Enter a size of at least 1 share' }
  const p = formatOutcomePrice(price)
  const notional = Number(p) * Number(s)
  if (notional < OUTCOME_MIN_NOTIONAL_USD)
    return { ok: false, reason: `Minimum order value is $${OUTCOME_MIN_NOTIONAL_USD}` }
  if (available !== undefined) {
    if (isBuy && notional > available + 1e-9) return { ok: false, reason: 'Insufficient balance' }
    if (!isBuy && Number(s) > available + 1e-9) return { ok: false, reason: 'Insufficient shares' }
  }
  return { ok: true, price: p, size: s, notional }
}

export const buildOutcomeOrder = ({
  assetId,
  isBuy,
  price,
  size,
  tif
}: {
  assetId: number
  isBuy: boolean
  price: string
  size: string
  tif: OutcomeTif
}): OutcomeWireOrder => ({
  a: assetId,
  b: isBuy,
  p: price,
  s: size,
  r: false,
  t: { limit: { tif } }
})

/**
 * Split `totalShares` across `count` limit orders evenly spaced from `startPx`
 * to `endPx`. `skew` > 1 weights later orders heavier (1 = flat). Sizes are
 * whole shares; any rounding remainder goes to the last order.
 */
export const buildScaleOrders = ({
  totalShares,
  startPx,
  endPx,
  count,
  skew = 1
}: {
  totalShares: number
  startPx: number
  endPx: number
  count: number
  skew?: number
}): { price: string; size: string }[] => {
  const n = Math.max(1, Math.floor(count))
  const total = Math.floor(totalShares)
  if (total <= 0 || !Number.isFinite(startPx) || !Number.isFinite(endPx)) return []
  const prices: number[] = []
  for (let i = 0; i < n; i++) {
    prices.push(n === 1 ? startPx : startPx + (i * (endPx - startPx)) / (n - 1))
  }
  const weights = prices.map((_, i) => (n === 1 ? 1 : 1 + (i * (skew - 1)) / (n - 1)))
  const weightSum = weights.reduce((a, b) => a + b, 0)
  const sizes = weights.map((w) => Math.floor((total * w) / weightSum))
  const assigned = sizes.reduce((a, b) => a + b, 0)
  sizes[sizes.length - 1] += total - assigned
  return prices
    .map((px, i) => ({ price: formatOutcomePrice(px), size: formatOutcomeSize(sizes[i]) }))
    .filter((o) => o.size !== '')
}

/** Fee multiplier a venue's `deployerFeeScale` applies on top of the base tier. */
export const feeMultiplierForScale = (scale: number): number =>
  scale > 0 ? scale + Math.max(scale, 1) : 1
