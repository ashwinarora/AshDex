'use client'

import { useConnection, useWalletClient } from 'wagmi'
import { useInitHyperliquid } from '@/store/HyperliquidStore'
import { useEffect } from 'react'
import { zeroAddress } from 'viem'

const HyperLiquidInitializer = () => {
  const { address } = useConnection()
  const { data: walletClient } = useWalletClient()
  // const address = '0xa4ADD8273d7f47318675bDfBcce3E9648CdB4509'
  const {
    initSdk,
    sdkSubscriptionClient,
    sdkInfoClient,
    fetchPerpsMeta,
    subscribeToAllMids,
    unsubscribeFromAllMids,
    subscribeAssetCtxs,
    unsubscribeAssetCtxs,
    subscribeSpotAssetCtxs,
    unsubscribeSpotAssetCtxs,
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
    if (!sdkInfoClient) return
    fetchPerpsMeta().catch(console.error)
  }, [sdkInfoClient, fetchPerpsMeta])

  useEffect(() => {
    if (!sdkSubscriptionClient) return

    subscribeToAllMids()
    return () => {
      unsubscribeFromAllMids().catch(console.error)
    }
  }, [sdkSubscriptionClient, subscribeToAllMids, unsubscribeFromAllMids])

  // Live perp asset contexts — no user required, so subscribe as soon as the WS client is up.
  useEffect(() => {
    if (!sdkSubscriptionClient) return
    subscribeAssetCtxs().catch(console.error)
    return () => {
      unsubscribeAssetCtxs().catch(console.error)
    }
  }, [sdkSubscriptionClient, subscribeAssetCtxs, unsubscribeAssetCtxs])

  // Live spot asset contexts — also no user required.
  useEffect(() => {
    if (!sdkSubscriptionClient) return
    subscribeSpotAssetCtxs().catch(console.error)
    return () => {
      unsubscribeSpotAssetCtxs().catch(console.error)
    }
  }, [sdkSubscriptionClient, subscribeSpotAssetCtxs, unsubscribeSpotAssetCtxs])

  // webData2 delivers user-scoped state (positions / open orders / spot balances) —
  // don't bother subscribing without a connected wallet, since it stays silent for zeroAddress.
  useEffect(() => {
    if (!sdkSubscriptionClient || !address) return
    subscribeWebData2(address)
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
