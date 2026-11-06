import { describe, it, expect } from 'vitest'
import { resolveTradingAccount, type TreasuryTarget } from './tradingAccount'

const WALLET = '0x1111111111111111111111111111111111111111'
const TREASURY: TreasuryTarget = {
  address: '0x2222222222222222222222222222222222222222',
  network: 'testnet'
}

describe('resolveTradingAccount', () => {
  it('uses the connected wallet when no treasury is set', () => {
    expect(resolveTradingAccount({ wallet: WALLET, treasury: null, network: 'testnet' })).toEqual({
      address: WALLET,
      mode: 'wallet'
    })
  })

  it('has no address while disconnected', () => {
    expect(
      resolveTradingAccount({ wallet: undefined, treasury: null, network: 'testnet' })
    ).toEqual({ address: undefined, mode: 'wallet' })
  })

  it('trades for the treasury when one is set on this network', () => {
    expect(
      resolveTradingAccount({ wallet: WALLET, treasury: TREASURY, network: 'testnet' })
    ).toEqual({ address: TREASURY.address, mode: 'treasury', treasury: TREASURY })
  })

  it('ignores the treasury while disconnected', () => {
    expect(
      resolveTradingAccount({ wallet: undefined, treasury: TREASURY, network: 'testnet' })
    ).toEqual({ address: undefined, mode: 'wallet' })
  })

  it('ignores a treasury from the other network', () => {
    expect(
      resolveTradingAccount({ wallet: WALLET, treasury: TREASURY, network: 'mainnet' })
    ).toEqual({ address: WALLET, mode: 'wallet' })
  })
})
