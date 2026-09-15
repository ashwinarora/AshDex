import { describe, expect, it } from 'vitest'
import { validateTpslDirection } from './tpslValidation'

describe('validateTpslDirection — long positions', () => {
  const entry = 77_454

  it('accepts a well-formed long TP/SL (TP above entry, SL below)', () => {
    const r = validateTpslDirection({
      isLong: true,
      entryPrice: entry,
      tpTriggerPrice: 80_000,
      slTriggerPrice: 75_000
    })
    expect(r).toEqual({ tpValid: true, slValid: true, bothEmpty: false })
  })

  it('rejects TP below entry for a long (R3-B14 headline case: TP=1)', () => {
    const r = validateTpslDirection({
      isLong: true,
      entryPrice: entry,
      tpTriggerPrice: 1,
      slTriggerPrice: 75_000
    })
    expect(r.tpValid).toBe(false)
    expect(r.slValid).toBe(true)
  })

  it('rejects SL above entry for a long (R3-B14 mirror case: SL=200000)', () => {
    const r = validateTpslDirection({
      isLong: true,
      entryPrice: entry,
      tpTriggerPrice: 80_000,
      slTriggerPrice: 200_000
    })
    expect(r.tpValid).toBe(true)
    expect(r.slValid).toBe(false)
  })

  it('rejects TP === entry (must be strictly above/below)', () => {
    const r = validateTpslDirection({
      isLong: true,
      entryPrice: entry,
      tpTriggerPrice: entry
    })
    expect(r.tpValid).toBe(false)
  })

  it('treats empty strings as "not set" (passes)', () => {
    const r = validateTpslDirection({
      isLong: true,
      entryPrice: entry,
      tpTriggerPrice: '',
      slTriggerPrice: ''
    })
    expect(r).toEqual({ tpValid: true, slValid: true, bothEmpty: true })
  })

  it('treats undefined as "not set"', () => {
    const r = validateTpslDirection({ isLong: true, entryPrice: entry })
    expect(r.bothEmpty).toBe(true)
  })

  it('rejects NaN-parseable strings (treated as not-set → pass, but bothEmpty=true)', () => {
    const r = validateTpslDirection({
      isLong: true,
      entryPrice: entry,
      tpTriggerPrice: 'abc'
    })
    expect(r.tpValid).toBe(true)
    expect(r.bothEmpty).toBe(true)
  })
})

describe('validateTpslDirection — short positions', () => {
  const entry = 77_454

  it('accepts a well-formed short TP/SL (TP below entry, SL above)', () => {
    const r = validateTpslDirection({
      isLong: false,
      entryPrice: entry,
      tpTriggerPrice: 70_000,
      slTriggerPrice: 80_000
    })
    expect(r).toEqual({ tpValid: true, slValid: true, bothEmpty: false })
  })

  it('rejects TP above entry for a short', () => {
    const r = validateTpslDirection({
      isLong: false,
      entryPrice: entry,
      tpTriggerPrice: 80_000
    })
    expect(r.tpValid).toBe(false)
  })

  it('rejects SL below entry for a short', () => {
    const r = validateTpslDirection({
      isLong: false,
      entryPrice: entry,
      slTriggerPrice: 70_000
    })
    expect(r.slValid).toBe(false)
  })
})
