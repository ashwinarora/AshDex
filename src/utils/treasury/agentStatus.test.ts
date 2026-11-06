import { describe, it, expect } from 'vitest'
import { treasuryAgentStatus } from './agentStatus'

const KEY = '0xDbE6000000000000000000000000000000000001' as const
const NOW = 1_000_000
const listed = (validUntil: number) => [
  { address: '0x9999999999999999999999999999999999999999', name: 'other', validUntil: NOW + 5 },
  { address: KEY.toLowerCase(), name: 'ashdex dbe6', validUntil }
]

describe('treasuryAgentStatus', () => {
  it('has no key', () => {
    expect(
      treasuryAgentStatus({ keyAddress: null, cachedValidUntil: null, extraAgents: [], now: NOW })
    ).toEqual({ status: 'noKey' })
  })

  it('waits for approval while the key is not listed', () => {
    expect(
      treasuryAgentStatus({ keyAddress: KEY, cachedValidUntil: null, extraAgents: [], now: NOW })
    ).toEqual({ status: 'pending' })
  })

  it('is ready when listed and not expired, matching any address casing', () => {
    expect(
      treasuryAgentStatus({
        keyAddress: KEY,
        cachedValidUntil: null,
        extraAgents: listed(NOW + 1),
        now: NOW
      })
    ).toEqual({ status: 'ready', validUntil: NOW + 1, name: 'ashdex dbe6' })
  })

  it('is ready with no known expiry when validUntil is null', () => {
    expect(
      treasuryAgentStatus({
        keyAddress: KEY,
        cachedValidUntil: null,
        extraAgents: [{ address: KEY, name: 'ashdex dbe6', validUntil: null }],
        now: NOW
      })
    ).toEqual({ status: 'ready', validUntil: null, name: 'ashdex dbe6' })
  })

  it('is expired when listed with validUntil at or before now', () => {
    expect(
      treasuryAgentStatus({
        keyAddress: KEY,
        cachedValidUntil: null,
        extraAgents: listed(NOW),
        now: NOW
      })
    ).toEqual({ status: 'expired', validUntil: NOW })
  })

  it('is removed when it was live and vanished before expiring', () => {
    expect(
      treasuryAgentStatus({
        keyAddress: KEY,
        cachedValidUntil: NOW + 100,
        extraAgents: [],
        now: NOW
      })
    ).toEqual({ status: 'removed' })
  })

  it('is expired when it vanished after its cached expiry', () => {
    expect(
      treasuryAgentStatus({ keyAddress: KEY, cachedValidUntil: NOW - 1, extraAgents: [], now: NOW })
    ).toEqual({ status: 'expired', validUntil: NOW - 1 })
  })
})
