import type { Hex } from 'viem'

export type HyperliquidNetwork = 'mainnet' | 'testnet'

/** A multisig treasury that this browser trades for through its own agent key. */
export type TreasuryTarget = {
  address: Hex
  network: HyperliquidNetwork
}

/**
 * The account whose balances, positions, orders and fills the app shows and
 * trades for. In wallet mode it is the connected wallet. In treasury mode it is
 * the treasury, while the connected wallet still signs user-signed actions.
 */
export type TradingAccount = {
  address: Hex | undefined
  mode: 'wallet' | 'treasury'
  treasury?: TreasuryTarget
}

/**
 * Treasury mode applies only while a wallet is connected and only to a treasury
 * on this build's network. Otherwise the app falls back to plain wallet mode,
 * so a disconnected browser never shows a treasury's data.
 */
export const resolveTradingAccount = ({
  wallet,
  treasury,
  network
}: {
  wallet: Hex | undefined
  treasury: TreasuryTarget | null
  network: HyperliquidNetwork
}): TradingAccount => {
  if (!wallet) return { address: undefined, mode: 'wallet' }
  if (treasury && treasury.network === network) {
    return { address: treasury.address, mode: 'treasury', treasury }
  }
  return { address: wallet, mode: 'wallet' }
}
