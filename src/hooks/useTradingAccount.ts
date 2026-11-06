'use client'

import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { HYPERLIQUID_NETWORK } from '@/utils/constants'
import { resolveTradingAccount, type TradingAccount } from '@/utils/tradingAccount'

/**
 * The account to read and trade for. Use it for every address-keyed read
 * (balances, positions, orders, fills, fees, agents). User-signed actions
 * (send, withdraw, deposit, approvals) still use the connected wallet from
 * wagmi's `useConnection()`.
 */
export const useTradingAccount = (): TradingAccount => {
  const { address: wallet } = useConnection()
  const treasury = useHyperliquidStore((state) => state.treasury)
  return useMemo(
    () => resolveTradingAccount({ wallet, treasury, network: HYPERLIQUID_NETWORK }),
    [wallet, treasury]
  )
}
