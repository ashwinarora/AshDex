'use client'

import { useAccount } from 'wagmi'
import { useInitHyperliquid } from '@/store/HyperliquidStore'
import { useEffect } from 'react'
import { zeroAddress } from 'viem'

const HyperLiquidInitializer = () => {
  const { address } = useAccount()
  const {
    initSdk,
    sdkSubscriptionClient,
    subscribeToAllMids,
    unsubscribeFromAllMids,
    subscribeWebData2,
    unsubscribeWebData2,
    checkWebSocketStatus,
    updateUserActiveAddress
  } = useInitHyperliquid()

  useEffect(() => {
    initSdk(address ?? zeroAddress)
  }, [address, initSdk])

  useEffect(() => {
    if (!address) return
    updateUserActiveAddress(address)
  }, [address, updateUserActiveAddress])

  useEffect(() => {
    if (!sdkSubscriptionClient) return

    subscribeToAllMids()
    return () => {
      unsubscribeFromAllMids()
    }
  }, [sdkSubscriptionClient, subscribeToAllMids, unsubscribeFromAllMids])

  useEffect(() => {
    if (!sdkSubscriptionClient) return
    subscribeWebData2(address ?? zeroAddress)
    return () => {
      unsubscribeWebData2(address ?? zeroAddress)
    }
  }, [sdkSubscriptionClient, address, subscribeWebData2, unsubscribeWebData2])

  useEffect(() => {
    if (!sdkSubscriptionClient) return

    const intervalId = setInterval(checkWebSocketStatus, 5000)
    return () => clearInterval(intervalId)
  }, [sdkSubscriptionClient, checkWebSocketStatus])

  return null
}

export default HyperLiquidInitializer
