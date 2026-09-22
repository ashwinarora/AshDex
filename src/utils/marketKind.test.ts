import { describe, expect, it } from 'vitest'
import { getMarketKind, marketKindFromPathname } from './marketKind'

const spot = new Map([
  ['@107', 'HYPE'],
  ['PURR/USDC', 'PURR']
])

describe('getMarketKind', () => {
  it('classifies outcome, spot and perp coins', () => {
    expect(getMarketKind('#12100', spot)).toBe('outcome')
    expect(getMarketKind('@107', spot)).toBe('spot')
    expect(getMarketKind('PURR/USDC', spot)).toBe('spot')
    expect(getMarketKind('BTC', spot)).toBe('perp')
    expect(getMarketKind('xyz:CL', spot)).toBe('perp')
  })
})

describe('marketKindFromPathname', () => {
  it('maps routes', () => {
    expect(marketKindFromPathname('/')).toBe('perp')
    expect(marketKindFromPathname('/BTC')).toBe('perp')
    expect(marketKindFromPathname('/spot')).toBe('spot')
    expect(marketKindFromPathname('/spot/PURR')).toBe('spot')
    expect(marketKindFromPathname('/outcomes')).toBe('outcome')
    expect(marketKindFromPathname('/outcomes/1210/0')).toBe('outcome')
    expect(marketKindFromPathname(null)).toBe('perp')
  })
})
