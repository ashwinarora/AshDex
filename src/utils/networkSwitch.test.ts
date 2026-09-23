import { describe, it, expect } from 'vitest'
import { buildNetworkSwitchUrl } from './networkSwitch'

describe('buildNetworkSwitchUrl', () => {
  it('returns null when the counterpart URL is not configured', () => {
    expect(buildNetworkSwitchUrl('', '/BTC')).toBeNull()
    expect(buildNetworkSwitchUrl('   ', '/BTC')).toBeNull()
  })

  it('returns null for an unparseable URL', () => {
    expect(buildNetworkSwitchUrl('not a url', '/BTC')).toBeNull()
  })

  it('carries the current path onto the other deployment', () => {
    expect(buildNetworkSwitchUrl('https://testnet.ashdex.xyz', '/BTC')).toBe(
      'https://testnet.ashdex.xyz/BTC'
    )
    expect(buildNetworkSwitchUrl('https://testnet.ashdex.xyz', '/spot/PURR')).toBe(
      'https://testnet.ashdex.xyz/spot/PURR'
    )
    expect(buildNetworkSwitchUrl('https://testnet.ashdex.xyz', '/portfolio')).toBe(
      'https://testnet.ashdex.xyz/portfolio'
    )
  })

  it('collapses a per-network outcome id to the outcomes grid', () => {
    expect(buildNetworkSwitchUrl('https://ashdex.xyz', '/outcomes/1210/yes')).toBe(
      'https://ashdex.xyz/outcomes'
    )
    expect(buildNetworkSwitchUrl('https://ashdex.xyz', '/outcomes')).toBe(
      'https://ashdex.xyz/outcomes'
    )
  })

  it('handles a root path and a trailing slash on the base URL', () => {
    expect(buildNetworkSwitchUrl('https://ashdex.xyz/', '/')).toBe('https://ashdex.xyz/')
    expect(buildNetworkSwitchUrl('https://ashdex.xyz', '')).toBe('https://ashdex.xyz/')
  })

  it('preserves a base path prefix', () => {
    expect(buildNetworkSwitchUrl('https://ashdex.xyz/app/', '/BTC')).toBe(
      'https://ashdex.xyz/app/BTC'
    )
  })
})
