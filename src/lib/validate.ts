import { getAddress, isAddress } from 'viem'

/**
 * Result of validating a numeric-string amount from a user input.
 *
 * `value` is only meaningful when `ok === true`. When `ok === false`, `reason`
 * indicates which rule tripped; callers can use that to render inline helper
 * text (or ignore it and just gate their submit button).
 */
export type AmountValidity = {
  ok: boolean
  value: number
  reason?: 'empty' | 'nan' | 'nonfinite' | 'negative' | 'zero' | 'under_min' | 'over_max'
}

export type ValidateAmountOpts = {
  /** Lower bound, inclusive. If omitted, no lower-bound check. */
  min?: number
  /** Upper bound, inclusive. If omitted, no upper-bound check. */
  max?: number
  /**
   * When true, `"0"` passes validation. Default false — most trading inputs
   * (order size, transfer, withdraw) treat zero as no-op and should disable
   * submit.
   */
  allowZero?: boolean
}

/**
 * Validate a numeric-string input against zero/negative/NaN/Infinity and
 * optional [min, max] bounds. Written to replace the widespread pattern
 * `!amount || parseFloat(amount) === 0`, which passes `"abc"` (parseFloat
 * returns NaN, `NaN === 0` is false → button enabled).
 *
 * Trims surrounding whitespace so `"  0.5  "` and `"0.5"` behave the same.
 * Empty and whitespace-only strings fail with `reason: 'empty'`.
 */
export function validateAmount(input: string, opts?: ValidateAmountOpts): AmountValidity {
  const trimmed = typeof input === 'string' ? input.trim() : ''
  if (trimmed === '') return { ok: false, value: 0, reason: 'empty' }

  const parsed = Number(trimmed)

  if (Number.isNaN(parsed)) return { ok: false, value: 0, reason: 'nan' }
  if (!Number.isFinite(parsed)) return { ok: false, value: 0, reason: 'nonfinite' }
  if (parsed < 0) return { ok: false, value: parsed, reason: 'negative' }
  if (!opts?.allowZero && parsed === 0) return { ok: false, value: 0, reason: 'zero' }

  if (opts?.min !== undefined && parsed < opts.min) {
    return { ok: false, value: parsed, reason: 'under_min' }
  }
  if (opts?.max !== undefined && parsed > opts.max) {
    return { ok: false, value: parsed, reason: 'over_max' }
  }

  return { ok: true, value: parsed }
}

export type AddressValidity = {
  ok: boolean
  /** EIP-55 checksummed form of `input` when valid; undefined otherwise. */
  checksummed?: `0x${string}`
}

/**
 * Validate an EVM address. Delegates to viem's `isAddress` (which accepts
 * both any-case and checksummed forms) and returns the checksummed form so
 * callers can compare addresses without a separate normalisation step.
 *
 * Whitespace is trimmed; empty input fails.
 */
export function validateAddress(input: string): AddressValidity {
  const trimmed = typeof input === 'string' ? input.trim() : ''
  if (!isAddress(trimmed)) return { ok: false }
  return { ok: true, checksummed: getAddress(trimmed) }
}

/**
 * Return `n` clamped to `[min, max]`. Non-finite `n` returns `min` — safer
 * than propagating NaN/Infinity into UI state that the caller then
 * `.toFixed`s.
 */
export function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min
  if (n < min) return min
  if (n > max) return max
  return n
}
