import { describe, it, expect } from 'vitest'
import { parseTreasuryRoute, siblingTreasuryUrl, treasuryPageHref } from './route'

const T = '0x146432842836EF7381187dfc5a279edaa668233e'
const A = '0xDBE6000000000000000000000000000000000001'
const q = (s: string) => new URLSearchParams(s)

describe('parseTreasuryRoute', () => {
  it('parses a treasury with an agent, lower-casing both', () => {
    expect(parseTreasuryRoute(q(`network=testnet&treasury=${T}&agent=${A}`), 'testnet')).toEqual({
      kind: 'treasury',
      network: 'testnet',
      treasury: T.toLowerCase(),
      agent: A.toLowerCase()
    })
  })

  it('defaults the network to the build and the agent to none', () => {
    expect(parseTreasuryRoute(q(`treasury=${T}&name=x&validUntil=1`), 'testnet')).toEqual({
      kind: 'treasury',
      network: 'testnet',
      treasury: T.toLowerCase(),
      agent: null
    })
  })

  it('asks for a treasury when none is given', () => {
    expect(parseTreasuryRoute(q('network=testnet'), 'testnet')).toEqual({
      kind: 'pick',
      network: 'testnet'
    })
  })

  it('flags the other network', () => {
    expect(parseTreasuryRoute(q(`network=mainnet&treasury=${T}`), 'testnet')).toEqual({
      kind: 'otherNetwork',
      network: 'mainnet'
    })
  })

  it('rejects bad input', () => {
    expect(parseTreasuryRoute(q('network=devnet'), 'testnet').kind).toBe('invalid')
    expect(parseTreasuryRoute(q('treasury=0x1234'), 'testnet').kind).toBe('invalid')
    expect(parseTreasuryRoute(q(`treasury=${T}&agent=nope`), 'testnet').kind).toBe('invalid')
  })
})

describe('siblingTreasuryUrl', () => {
  it('keeps the query on the sibling deployment', () => {
    expect(siblingTreasuryUrl('https://ashdex.app', `?network=mainnet&treasury=${T}`)).toBe(
      `https://ashdex.app/treasury?network=mainnet&treasury=${T}`
    )
  })

  it('returns null without a sibling URL', () => {
    expect(siblingTreasuryUrl('', '?network=mainnet')).toBeNull()
  })
})

describe('treasuryPageHref', () => {
  it('links to the setup page', () => {
    expect(treasuryPageHref('testnet', T)).toBe(`/treasury?network=testnet&treasury=${T}`)
    expect(treasuryPageHref('mainnet')).toBe('/treasury?network=mainnet')
  })
})
