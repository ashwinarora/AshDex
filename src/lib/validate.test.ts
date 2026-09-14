import { describe, expect, it } from 'vitest'
import { clamp, validateAddress, validateAmount } from './validate'

describe('validateAmount', () => {
  describe('rejects invalid inputs', () => {
    it.each([
      ['empty string', ''],
      ['whitespace only', '   '],
      ['pure text', 'abc'],
      ['NaN literal', 'NaN'],
      ['Infinity literal', 'Infinity'],
      ['-Infinity literal', '-Infinity'],
      ['lone dot', '.'],
      ['double dot', '..'],
      ['trailing garbage', '1.2.3'],
      ['comma separator', '1,000']
    ])('rejects %s', (_, input) => {
      const r = validateAmount(input)
      expect(r.ok).toBe(false)
    })

    it.each([
      ['NaN', 'nan'],
      ['Infinity', 'nonfinite'],
      ['-Infinity', 'nonfinite']
    ])('labels %s with reason %s', (input, reason) => {
      expect(validateAmount(input).reason).toBe(reason)
    })
  })

  describe('zero handling', () => {
    it('rejects "0" by default (zero would be a no-op submit)', () => {
      expect(validateAmount('0')).toEqual({ ok: false, value: 0, reason: 'zero' })
    })

    it('accepts "0" when allowZero=true', () => {
      expect(validateAmount('0', { allowZero: true })).toEqual({ ok: true, value: 0 })
    })

    it('rejects "0.00"', () => {
      expect(validateAmount('0.00').reason).toBe('zero')
    })

    it('rejects "0." (parses to 0)', () => {
      expect(validateAmount('0.').reason).toBe('zero')
    })

    it('rejects ".0" (parses to 0)', () => {
      expect(validateAmount('.0').reason).toBe('zero')
    })
  })

  describe('negative and bounds', () => {
    it('rejects negative numbers', () => {
      expect(validateAmount('-1').reason).toBe('negative')
      expect(validateAmount('-0.001').reason).toBe('negative')
    })

    it('respects min bound (inclusive)', () => {
      expect(validateAmount('0.5', { min: 1 }).reason).toBe('under_min')
      expect(validateAmount('1', { min: 1 }).ok).toBe(true)
    })

    it('respects max bound (inclusive)', () => {
      expect(validateAmount('101', { max: 100 }).reason).toBe('over_max')
      expect(validateAmount('100', { max: 100 }).ok).toBe(true)
    })

    it('respects min=0 (a value the old numberInputValidator falsy-check bug hit)', () => {
      expect(validateAmount('-1', { min: 0 }).reason).toBe('negative')
    })
  })

  describe('happy paths', () => {
    it('accepts a plain positive number', () => {
      expect(validateAmount('0.5')).toEqual({ ok: true, value: 0.5 })
    })

    it('trims surrounding whitespace', () => {
      expect(validateAmount('  0.5  ')).toEqual({ ok: true, value: 0.5 })
    })

    it('accepts scientific notation Number can parse (edge case)', () => {
      // We don't strip 'e' notation — Number('1e5') = 100000. Callers that
      // want to reject it should combine with an on-change regex.
      expect(validateAmount('1e5')).toEqual({ ok: true, value: 1e5 })
    })
  })
})

describe('validateAddress', () => {
  it('accepts all-lowercase and returns EIP-55 checksummed form', () => {
    // Don't hand-write EIP-55 checksums (easy to typo). Trust that viem's
    // getAddress produces valid checksums; assert the shape instead.
    const r = validateAddress('0x7b676e8794d69c2e92656daa0c6b4b4bd9c3496e')
    expect(r.ok).toBe(true)
    expect(r.checksummed).toMatch(/^0x[0-9a-fA-F]{40}$/)
    expect(r.checksummed?.toLowerCase()).toBe('0x7b676e8794d69c2e92656daa0c6b4b4bd9c3496e')
    // Should be mixed case (i.e., checksummed).
    expect(r.checksummed).not.toBe(r.checksummed?.toLowerCase())
  })

  it('rejects all-uppercase (viem treats it as a failed checksum)', () => {
    // viem's isAddress requires either all-lowercase or valid EIP-55.
    // All-uppercase is neither, so it's rejected. Documenting the observed
    // behaviour so future callers know to lower-case first if they must.
    const r = validateAddress('0x7B676E8794D69C2E92656DAA0C6B4B4BD9C3496E')
    expect(r.ok).toBe(false)
  })

  it('rejects too-short addresses', () => {
    expect(validateAddress('0x1234').ok).toBe(false)
  })

  it('rejects non-hex characters in the right length', () => {
    expect(validateAddress('0xZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ').ok).toBe(false)
  })

  it('rejects missing 0x prefix', () => {
    expect(validateAddress('7B676e8794D69c2e92656DaA0C6B4b4BD9C3496e').ok).toBe(false)
  })

  it('rejects empty input', () => {
    expect(validateAddress('').ok).toBe(false)
  })

  it('trims whitespace', () => {
    const r = validateAddress('  0x7b676e8794d69c2e92656daa0c6b4b4bd9c3496e  ')
    expect(r.ok).toBe(true)
  })
})

describe('clamp', () => {
  it('returns n when within [min, max]', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('returns min when n < min', () => {
    expect(clamp(-1, 0, 10)).toBe(0)
  })

  it('returns max when n > max', () => {
    expect(clamp(999, 0, 10)).toBe(10)
  })

  it('returns min for NaN (safer than propagating)', () => {
    expect(clamp(NaN, 1, 100)).toBe(1)
  })

  it('returns min for Infinity', () => {
    expect(clamp(Infinity, 0, 100)).toBe(0)
  })

  it('returns min for -Infinity', () => {
    expect(clamp(-Infinity, 0, 100)).toBe(0)
  })

  it('handles fractional bounds', () => {
    expect(clamp(0.05, 0.1, 100)).toBe(0.1)
  })
})
