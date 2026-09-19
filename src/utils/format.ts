import { normalizeDecimalString } from '@/utils/decimalString'
export const formatSolanaAddress = (address: string) => {
  if (!address) return ''
  const addressStr = address.toString()
  return `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`
}

export const formatWithKMB = (input: string | number): string => {
  const suffixes = ['', 'k', 'M', 'B', 'T']
  let value: number

  // Parse number
  if (typeof input === 'string') {
    value = parseFloat(input.replace(/[^0-9.]/g, ''))
  } else {
    value = input
  }

  // If value is under 10,000 – format with commas and return without suffix
  if (value < 10000) {
    const formatted = value.toLocaleString('en-US', {
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    })
    return `${formatted}`
  }

  // Else apply suffix logic
  let suffixIndex = 0
  while (value >= 1000 && suffixIndex < suffixes.length - 1) {
    value /= 1000
    suffixIndex++
  }

  const formatted = value.toFixed(2).replace(/\.00$/, '')
  return `${formatted}${suffixes[suffixIndex]}`
}

/**
 * Format an epoch-ms timestamp as `YYYY-MM-DD HH:mm:ss UTC` — unambiguous
 * across locales and timezones. Replaces scattered `.toLocaleString('en-US')`
 * calls that render as `9/9/2026, 3:13:30 AM` (US month/day/year, confusing
 * for non-US readers).
 */
export function formatTimestamp(ms: number): string {
  const d = new Date(ms)
  const p = (n: number, w = 2) => String(n).padStart(w, '0')
  return `${p(d.getUTCFullYear(), 4)}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`
}

/**
 * Trim a numeric string to at most `decimals` fractional digits (truncating,
 * not rounding — Hyperliquid does its own rounding on the wire). Used to
 * strip Float32/Float64 quantisation noise like `0.10000000149011612` before
 * showing it in an input.
 *
 * Preserved-behavior notes (do not change without a separate bug filing):
 *   - `decimals === 0` returns the value unchanged (falsy check).
 *   - Non-numeric strings pass through unchanged.
 */
export function trimDecimals(value: string, decimals: number): string {
  if (!value) return value
  const [int, dec] = value.split('.')
  if (!decimals || !dec) return value
  return `${int}.${dec.slice(0, decimals)}`
}

export const formatWithCommas = (input: string | number, toFixed: number = 2): string => {
  let value: number

  // Parse number
  if (typeof input === 'string') {
    value = parseFloat(input.replace(/[^0-9.]/g, ''))
  } else {
    value = input
  }

  // Non-finite inputs (NaN, Infinity from divide-by-zero, Number('-'), etc.)
  // shouldn't leak the string "NaN" into the UI.
  if (!Number.isFinite(value)) return '--'

  // Format with commas and remove trailing .00
  const formatted = value.toFixed(toFixed)
  const withoutTrailingZeros = normalizeDecimalString(formatted)

  return parseFloat(withoutTrailingZeros).toLocaleString('en-US')
}
