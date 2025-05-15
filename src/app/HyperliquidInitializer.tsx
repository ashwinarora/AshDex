'use client'

import { useAccount } from 'wagmi'
import { useInitHyperliquid } from '@/store/HyperliquidStore'
import { useEffect } from 'react'
import { zeroAddress } from 'viem'

export const HyperLiquidInitializer = () => {
  const { address } = useAccount()

  const {
    initSdk,
    sdk,
    subscribeToAllMids,
    unsubscribeFromAllMids,
    subscribeWebData2,
    unsubscribeWebData2
  } = useInitHyperliquid()

  useEffect(() => {
    initSdk(address ?? zeroAddress)
  }, [address])

  useEffect(() => {
    if (!sdk) return
    subscribeToAllMids()
    subscribeWebData2(address ?? zeroAddress)
    return () => {
      unsubscribeFromAllMids()
      unsubscribeWebData2(address ?? zeroAddress)
    }
  }, [sdk, address])

  return null
}
