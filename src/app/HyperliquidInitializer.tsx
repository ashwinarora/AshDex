'use client'

import { useAccount, useWalletClient } from 'wagmi'
import { useInitHyperliquid } from '@/store/HyperliquidStore'
import { useEffect } from 'react'
import { zeroAddress } from 'viem'

const HyperLiquidInitializer = () => {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  // const address = '0xa4ADD8273d7f47318675bDfBcce3E9648CdB4509'
  const {
    initSdk,
    sdkSubscriptionClient,
    subscribeToAllMids,
    unsubscribeFromAllMids,
    subscribeWebData2,
    unsubscribeWebData2,
    subscribeLedgerUpdates,
    unsubscribeLedgerUpdates,
    checkWebSocketStatus,
    updateUserActiveAddress,
    loadPendingWithdrawals
  } = useInitHyperliquid()

  useEffect(() => {
    const addressToUse = address ?? zeroAddress
    initSdk(addressToUse, walletClient)
  }, [address, initSdk, walletClient])

  useEffect(() => {
    if (!address) return
    updateUserActiveAddress(address)
    loadPendingWithdrawals(address)
  }, [address, updateUserActiveAddress, loadPendingWithdrawals])

  useEffect(() => {
    if (!sdkSubscriptionClient) return

    subscribeToAllMids()
    return () => {
      unsubscribeFromAllMids().catch(console.error)
    }
  }, [sdkSubscriptionClient, subscribeToAllMids, unsubscribeFromAllMids])

  useEffect(() => {
    if (!sdkSubscriptionClient) return
    subscribeWebData2(address ?? zeroAddress)
    return () => {
      unsubscribeWebData2().catch(console.error)
    }
  }, [sdkSubscriptionClient, address, subscribeWebData2, unsubscribeWebData2])

  useEffect(() => {
    if (!sdkSubscriptionClient || !address) return
    subscribeLedgerUpdates(address)
    return () => {
      unsubscribeLedgerUpdates().catch(console.error)
    }
  }, [sdkSubscriptionClient, address, subscribeLedgerUpdates, unsubscribeLedgerUpdates])

  useEffect(() => {
    if (!sdkSubscriptionClient) return

    const intervalId = setInterval(checkWebSocketStatus, 5000)
    return () => clearInterval(intervalId)
  }, [sdkSubscriptionClient, checkWebSocketStatus])

  return null
}

export default HyperLiquidInitializer
