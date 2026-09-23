import { describe, it, expect } from 'vitest'
import { classifyDripResponse } from './faucet'

describe('classifyDripResponse', () => {
  it('treats an empty body as a successful drip', () => {
    expect(classifyDripResponse('')).toEqual({ ok: true })
    expect(classifyDripResponse('   ')).toEqual({ ok: true })
    expect(classifyDripResponse(null)).toEqual({ ok: true })
    expect(classifyDripResponse(undefined)).toEqual({ ok: true })
  })

  it('flags the once-per-address refusal', () => {
    const result = classifyDripResponse('Drip already claimed')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe('alreadyClaimed')
    expect(result.message).toMatch(/one-time per address/i)
  })

  it('flags the missing-mainnet-account refusal', () => {
    const result = classifyDripResponse(
      'Cannot claim drip because user 0xdead does not exist on mainnet.'
    )
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe('noMainnetAccount')
    expect(result.message).toMatch(/deposit on mainnet/i)
  })

  it('passes an unrecognised refusal through verbatim', () => {
    const result = classifyDripResponse('Faucet temporarily disabled')
    expect(result).toEqual({
      ok: false,
      reason: 'unknown',
      message: 'Faucet temporarily disabled'
    })
  })
})
