import { describe, expect, it } from 'vitest'
import { formatTimestamp, trimDecimals } from './format'

describe('formatTimestamp (BUG-035)', () => {
  it('formats a Sept 2026 UTC timestamp unambiguously (ISO-ish, tz-safe)', () => {
    // Reference: 2026-09-09 03:13:30 UTC (month is 0-indexed in Date.UTC).
    const ms = Date.UTC(2026, 8, 9, 3, 13, 30)
    expect(formatTimestamp(ms)).toBe('2026-09-09 03:13:30 UTC')
  })

  it('formats the Unix epoch', () => {
    expect(formatTimestamp(0)).toBe('1970-01-01 00:00:00 UTC')
  })

  it('formats a far-future timestamp without breaking', () => {
    const ms = Date.UTC(2099, 11, 31, 23, 59, 59)
    expect(formatTimestamp(ms)).toBe('2099-12-31 23:59:59 UTC')
  })

  it('pads single-digit month/day/time components with a leading zero', () => {
    const ms = Date.UTC(2026, 0, 1, 0, 0, 0)
    expect(formatTimestamp(ms)).toBe('2026-01-01 00:00:00 UTC')
  })
})

describe('trimDecimals (BUG-053)', () => {
  it('trims a Float32-leaky value to the allowed decimals', () => {
    // The exact string the QA session captured in the Market Close dialog.
    expect(trimDecimals('0.10000000149011612', 2)).toBe('0.10')
  })

  it('returns integer-string unchanged when it has no decimal part', () => {
    expect(trimDecimals('42', 2)).toBe('42')
  })

  it('leaves short-decimal values alone when they already fit', () => {
    expect(trimDecimals('0.1', 5)).toBe('0.1')
  })

  it('returns empty string unchanged', () => {
    expect(trimDecimals('', 2)).toBe('')
  })
})
