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
  }, [address, initSdk])

  useEffect(() => {
    if (!sdk) return

    subscribeToAllMids()
    return () => {
      unsubscribeFromAllMids()
    }
  }, [sdk, subscribeToAllMids, unsubscribeFromAllMids])

  useEffect(() => {
    if (!sdk) return
    subscribeWebData2(address ?? zeroAddress)
    return () => {
      unsubscribeWebData2(address ?? zeroAddress)
    }
  }, [sdk, address, subscribeWebData2, unsubscribeWebData2])

  return null
}
