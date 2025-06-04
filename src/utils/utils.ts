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
    return []
  }

  // Determine how many interior ticks we want
  const count =
    high < 6
      ? high - 2 // e.g. maxLeverage=5 → count=3 (ticks: 2,3,4)
      : t

  const ticks = new Set<number>()

  for (let i = 1; i <= count; i++) {
    // place at fraction i/(count+1) of the way from low → high
    const raw = low + (high - low) * (i / (count + 1))
    ticks.add(Math.floor(raw)) // bias down to avoid overshooting
  }

  return Array.from(ticks)
    .filter((n) => n > low && n < high) // drop any accidental endpoints
    .sort((a, b) => a - b)
}
