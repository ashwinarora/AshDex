import { describe, it, expect } from 'vitest'
import {
  buildApproveAgentProposeUrl,
  buildTreasuryPageUrl,
  buildTreasuryProposeUrl,
  normalizeAgentDays
} from './proposeLink'

const base = {
  network: 'testnet' as const,
  treasury: '0x2222222222222222222222222222222222222222' as const,
  agentAddress: '0xdbe6000000000000000000000000000000000000' as const,
  agentName: 'ashdex dbe6'
}

describe('normalizeAgentDays', () => {
  it('keeps the offered lengths and falls back to 7', () => {
    for (const d of [1, 7, 30, 90, 180]) expect(normalizeAgentDays(d)).toBe(d)
    expect(normalizeAgentDays(undefined)).toBe(7)
    expect(normalizeAgentDays(14)).toBe(7)
    expect(normalizeAgentDays(181)).toBe(7)
  })
})

describe('buildApproveAgentProposeUrl', () => {
  it('builds the hl-tools propose link with %20 for spaces', () => {
    expect(
      buildApproveAgentProposeUrl({ ...base, hltoolsUrl: 'http://localhost:3000', agentDays: 30 })
    ).toBe(
      'http://localhost:3000/multisig/propose?network=testnet' +
        '&treasury=0x2222222222222222222222222222222222222222&kind=approveAgent' +
        '&agentAddress=0xdbe6000000000000000000000000000000000000' +
        '&agentName=ashdex%20dbe6&agentDays=30'
    )
  })

  it('defaults to 7 days and keeps a base path', () => {
    const url = new URL(
      buildApproveAgentProposeUrl({ ...base, hltoolsUrl: 'https://hltools.tech/app/' })!
    )
    expect(url.pathname).toBe('/app/multisig/propose')
    expect(url.searchParams.get('agentDays')).toBe('7')
    expect(url.searchParams.get('agentName')).toBe('ashdex dbe6')
  })

  it('returns null without a usable base URL', () => {
    expect(buildApproveAgentProposeUrl({ ...base, hltoolsUrl: '' })).toBeNull()
    expect(buildApproveAgentProposeUrl({ ...base, hltoolsUrl: 'not a url' })).toBeNull()
  })
})

describe('buildTreasuryProposeUrl', () => {
  it('links a user-signed action to the propose form', () => {
    expect(
      buildTreasuryProposeUrl({
        hltoolsUrl: 'http://localhost:3000',
        network: 'testnet',
        treasury: base.treasury,
        kind: 'withdraw3'
      })
    ).toBe(
      'http://localhost:3000/multisig/propose?network=testnet' +
        '&treasury=0x2222222222222222222222222222222222222222&kind=withdraw3'
    )
  })

  it('returns null without a usable base URL', () => {
    expect(
      buildTreasuryProposeUrl({
        hltoolsUrl: '',
        network: 'testnet',
        treasury: base.treasury,
        kind: 'sendUsdc'
      })
    ).toBeNull()
  })
})

describe('buildTreasuryPageUrl', () => {
  it("links to the treasury's hl-tools page", () => {
    expect(
      buildTreasuryPageUrl({
        hltoolsUrl: 'https://hltools.tech/',
        network: 'mainnet',
        treasury: base.treasury
      })
    ).toBe('https://hltools.tech/multisig/t/mainnet/0x2222222222222222222222222222222222222222')
  })
})
