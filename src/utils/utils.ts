import { bytesToHex, Hex, hexToBytes } from 'viem'
import { MetaData } from './hyperliquid/hyperLiquidTypes'
import { MAX_DECIMALS_PERP, MAX_DECIMALS_SPOT, TOOLTIP_CONTENTS } from './constants'

export const toHumanNumber = (
  value?: bigint | null,
  decimals: number = 18,
  toFixed?: number
): string | null => {
  if (value === undefined || value === null) {
    return null
  }
  const divisor = BigInt(10) ** BigInt(decimals)
  const num = value / divisor
  const remainder = value % divisor

  const numString =
    toFixed === undefined
      ? `${num}.${remainder.toString().padStart(decimals, '0')}`
      : `${num}.${remainder.toString().padStart(decimals, '0').slice(0, toFixed)}`

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: toFixed ?? decimals
  }).format(parseFloat(numString))
}

export const toRealNumber = (value: string, decimals: number = 18): bigint => {
  const [integerPart, fractionalPart = ''] = value.split('.')
  const paddedFraction = fractionalPart.padEnd(decimals, '0')
  return BigInt(integerPart) * BigInt(10) ** BigInt(decimals) + BigInt(paddedFraction)
}

export const truncateAddress = (address: string): string => {
  if (!address || address.length < 10) {
    return address
  }
  const firstPart = address.slice(0, 6)
  const lastPart = address.slice(-4)
  return `${firstPart}...${lastPart}`
}

export function splitSignature(signature: Hex) {
  const signatureBytes = hexToBytes(signature)

  if (signatureBytes.length !== 65) {
    throw new Error('Invalid signature length: must be 65 bytes.')
  }

  const rBytes = signatureBytes.slice(0, 32)
  const sBytes = signatureBytes.slice(32, 64)
  const v = signatureBytes[64]

  const r = bytesToHex(rBytes)
  const s = bytesToHex(sBytes)

  return { r, s, v }
}

export function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ')
}

export const getUniverseIndex = (universe: MetaData[], asset: string): number => {
  return universe.findIndex((item) => item.name === asset)
}

export const getCoinName = (asset: string): string => {
  if (asset.endsWith('-PERP')) {
    return asset.slice(0, -5)
  }
  return asset
}

// refer https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size
export const roundToSignificantFigures = (num: number, sigFigs: number = 5): number => {
  if (num === 0) return 0

  if (Number.isInteger(num)) return num

  const digits = Math.floor(Math.log10(Math.abs(num))) + 1
  const factor = Math.pow(10, sigFigs - digits)
  return Math.round(num * factor) / factor
}

export const formatPrice = (price: number, szDecimals: number, isSpot: boolean = false): number => {
  // Integer prices are always allowed regardless of number of significant figures
  if (Number.isInteger(price)) {
    return price
  }

  // For non-integer prices, enforce 5 significant figures limit
  const sigFigsPrice = roundToSignificantFigures(price, 5)

  // Apply decimal places restriction: MAX_DECIMALS - szDecimals
  const maxDecimals = isSpot ? MAX_DECIMALS_SPOT : MAX_DECIMALS_PERP
  const allowedDecimals = maxDecimals - szDecimals

  // Format to the allowed number of decimal places
  const formattedPrice = parseFloat(sigFigsPrice.toFixed(allowedDecimals))
  return formattedPrice
}

export const getTooltipContent = (key: string): string => {
  const tooltipItem = TOOLTIP_CONTENTS?.find((item) => item?.key === key)
  return tooltipItem ? tooltipItem?.content : ''
}
interface FormatPriceOptions {
  price: number
  isSpot: boolean
  szDecimals: number
}

export function getFormattedPrice({ price, isSpot, szDecimals }: FormatPriceOptions): string {
  const maxDecimals = isSpot ? MAX_DECIMALS_SPOT : MAX_DECIMALS_PERP
  const allowedDecimals = maxDecimals - szDecimals

  const raw = price.toString()
  const [intPart, decPart = ''] = raw.split('.')
  const intSig = intPart.replace(/^0+/, '').length

  if (intSig >= 5 || !decPart) {
    return intPart
  }

  const totalSig = intSig + decPart.length
  if (totalSig > 5) {
    const keep = 5 - intSig
    return keep > 0 ? `${intPart}.${decPart.slice(0, keep)}` : intPart
  }

  const fracKeep = Math.min(allowedDecimals, decPart.length)
  return fracKeep > 0 ? `${intPart}.${decPart.slice(0, fracKeep)}` : intPart
}

export function getLeverageTicks(maxLeverage: number, t: number): number[] {
  const low = 1
  const high = maxLeverage

  // No interior values possible when maxLeverage ≤ 2
  if (high <= 2) {
    return [low, high]
  }

  // Determine how many interior ticks we want
  const count =
    high < 6
      ? high - 2 // e.g. maxLeverage=5 → count=3 (ticks: 2,3,4)
      : t

  const ticks = new Set<number>([low, high]) // Initialize with endpoints

  for (let i = 1; i <= count; i++) {
    // place at fraction i/(count+1) of the way from low → high
    const raw = low + (high - low) * (i / (count + 1))
    ticks.add(Math.floor(raw)) // bias down to avoid overshooting
  }

  return Array.from(ticks).sort((a, b) => a - b)
}

interface LiquidationPriceParams {
  entryPrice: number
  positionSize: number
  leverage: number
  isBuy: boolean
  usdAmount: number
  isCross: boolean
  maxLeverage: number
  crossAccountValue: number
}

/**
 * Calculates the liquidation price for a position based on Hyperliquid's formula
 * @param params LiquidationPriceParams object containing:
 *   - entryPrice: The entry price of the position
 *   - positionSize: The size of the position
 *   - leverage: The leverage used
 *   - isBuy: Whether the position is long (true) or short (false)
 *   - usdAmount: The USD value of the position
 *   - isCross: Whether the position is cross margin (true) or isolated margin (false)
 *   - maxLeverage: The maximum leverage allowed for the asset
 * @returns The liquidation price as a string with 2 decimal places, or 'N/A' if position value < $10
 */
export function calculateLiquidationPrice({
  entryPrice,
  positionSize,
  leverage,
  isBuy,
  usdAmount,
  isCross,
  maxLeverage,
  crossAccountValue
}: LiquidationPriceParams): string | number {
  if (
    !entryPrice ||
    !positionSize ||
    entryPrice <= 0 ||
    positionSize <= 0 ||
    leverage <= 0 ||
    maxLeverage <= 0
  ) {
    return 'N/A'
  }

  // Notional value of the position
  const notionalValue = entryPrice * positionSize

  // Initial margin required = position_size * mark_price / leverage
  const initialMargin = notionalValue / leverage

  // Maintenance margin is half of initial margin at max leverage
  const maintenanceMargin = notionalValue / (2 * maxLeverage)

  // For cross margin: margin_available = account_value - maintenance_margin_required
  // For isolated margin: margin_available = isolated_margin - maintenance_margin_required
  const marginAvailable = isCross
    ? crossAccountValue - maintenanceMargin // Cross margin uses account value
    : initialMargin - maintenanceMargin // Isolated margin uses initial margin

  const side = isBuy ? 1 : -1
  const l = 1 / maxLeverage

  // Liquidation price formula from docs:
  // liq_price = price - side * margin_available / position_size / (1 - l * side)
  const marginOverPosition = marginAvailable / positionSize
  const denominator = 1 - l * side
  const priceAdjustment = (side * marginOverPosition) / denominator
  const liqPrice = entryPrice - priceAdjustment

  if (usdAmount < 10 || liqPrice < 0) {
    return 'N/A'
  }

  return Number(liqPrice).toFixed(2)
}

/** ------------------------------------------------------------------ *
 * Precision-label generation
 * Inspired by the nSigFigs → tick-size mapping used on Hyperliquid
 * ------------------------------------------------------------------ */

export type SigFig = 2 | 3 | 4 | 5 | 6 | null
export type LabelEntry = { value: SigFig; label: string }

/** Factors relative to the “base step” (10^(order-1)) we want to show.
 *  Feel free to tweak or extend this list – the algorithm adapts.       */
const FACTORS: [SigFig, number][] = [
  [2, 1], // 1 × base step
  [3, 0.1], // 1/10 × base step
  [4, 0.01], // 1/100 × base step
  [5, 0.005], // 1/200 × base step
  [6, 0.002], // 1/500 × base step
  [null, 0.001] // 1/1 000 × base step
]

/** Utility that converts a number to the shortest *decimal* string
 *  (no trailing zeros, no exponent). */
const toCleanString = (n: number): string => n.toPrecision(10).replace(/(?:\.0+|(\.\d+?)0+)$/, '$1')

/** ------------------------------------------------------------------ *
 * The only exported function
 * ------------------------------------------------------------------ */
export function generatePrecisionLabels(marketPrice: number): LabelEntry[] {
  const price = Math.abs(marketPrice)
  if (!Number.isFinite(price) || price === 0) return []

  /* 1. Determine the “base step”.
   *    For 123 456  -> 10 000
   *    For 7 500    ->    100
   *    For 0.00891  ->  0.0001                                     */
  const exponent = Math.floor(Math.log10(price))
  const baseStep = 10 ** (exponent - 1) // 10^(k-1)
  
  /* 2. Scale every nominal factor by the base step, format nicely.   */
  return FACTORS.map(([value, factor]) => ({
    value,
    label: toCleanString(baseStep * (exponent > 4 && value === null ? factor/10 : factor))
  }))
}
