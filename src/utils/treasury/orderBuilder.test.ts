import { describe, it, expect } from 'vitest'
import { orderBuilder } from './orderBuilder'

const B = '0x702cF0a47560074Da1E25325b783F0d58E539373'

describe('orderBuilder', () => {
  it('always carries the builder in wallet mode', () => {
    expect(orderBuilder({ mode: 'wallet', builderAddress: B, fee: 3 })).toEqual({ b: B, f: 3 })
    expect(orderBuilder({ mode: 'wallet', builderAddress: B, fee: 0 })).toEqual({ b: B, f: 0 })
  })

  it('skips a zero fee when asked (outcome orders)', () => {
    expect(
      orderBuilder({ mode: 'wallet', builderAddress: B, fee: 0, omitZeroFee: true })
    ).toBeUndefined()
    expect(orderBuilder({ mode: 'wallet', builderAddress: B, fee: 2, omitZeroFee: true })).toEqual({
      b: B,
      f: 2
    })
  })

  it('never carries a builder in treasury mode', () => {
    expect(orderBuilder({ mode: 'treasury', builderAddress: B, fee: 3 })).toBeUndefined()
    expect(
      orderBuilder({ mode: 'treasury', builderAddress: B, fee: 3, omitZeroFee: true })
    ).toBeUndefined()
  })
})
