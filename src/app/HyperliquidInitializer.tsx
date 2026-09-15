'use client'

import { useConnection, useWalletClient } from 'wagmi'
import { useInitHyperliquid } from '@/store/HyperliquidStore'
import { useEffect } from 'react'
import { zeroAddress } from 'viem'
import { useAutoReferral } from '@/hooks/useAutoReferral'

const HyperLiquidInitializer = () => {
  const { address } = useConnection()
  const { data: walletClient } = useWalletClient()
  useAutoReferral()
  // const address = '0xa4ADD8273d7f47318675bDfBcce3E9648CdB4509'
  const {
    initSdk,
    sdkSubscriptionClient,
    sdkInfoClient,
    fetchPerpsMeta,
    fetchSpotClearinghouseState,
    fetchClearinghouseState,
    fetchUserAbstraction,
    subscribeToAllMids,
    unsubscribeFromAllMids,
    subscribeAssetCtxs,
    unsubscribeAssetCtxs,
    subscribeSpotAssetCtxs,
    unsubscribeSpotAssetCtxs,
    subscribeUserState,
    unsubscribeUserState,
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
    if (!sdkInfoClient) return
    fetchPerpsMeta().catch(console.error)
  }, [sdkInfoClient, fetchPerpsMeta])

  // HTTP fallbacks — seed spot + perp state instantly on wallet connect so the
  // UI has real numbers during the brief window before the WS subs deliver
  // their first snapshot. The store setters no-op if the WS has already
  // populated fresher data, so this is safe to run alongside the WS subs.
  useEffect(() => {
    if (!sdkInfoClient || !address) return
    fetchSpotClearinghouseState(address).catch(console.error)
    fetchClearinghouseState(address).catch(console.error)
  }, [sdkInfoClient, address, fetchSpotClearinghouseState, fetchClearinghouseState])

  // Account abstraction mode determines whether spot balance or per-DEX perp
  // state is the source of truth for trading equity. Fetch on connect, and
  // re-fetch when the tab regains visibility so users who flip modes on
  // hyperliquid.xyz see AshDex update without a manual reload.
  useEffect(() => {
    if (!sdkInfoClient || !address) return
    fetchUserAbstraction(address).catch(console.error)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchUserAbstraction(address).catch(console.error)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [sdkInfoClient, address, fetchUserAbstraction])

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

  // All address-keyed setup lives in one effect: set the active address, load
  // pending withdrawals, and open the three user-scoped WS subs (spotState,
  // clearinghouseState, openOrders). Doing this together guarantees that
  // consumers of `userActiveAddress` see the right value before subs fire.
  useEffect(() => {
    if (!sdkSubscriptionClient || !address) return
    updateUserActiveAddress(address)
    loadPendingWithdrawals(address)
    subscribeUserState(address)
    subscribeLedgerUpdates(address)
    return () => {
      unsubscribeUserState().catch(console.error)
      unsubscribeLedgerUpdates().catch(console.error)
    }
  }, [
    sdkSubscriptionClient,
    address,
    updateUserActiveAddress,
    loadPendingWithdrawals,
    subscribeUserState,
    unsubscribeUserState,
    subscribeLedgerUpdates,
    unsubscribeLedgerUpdates
  ])

  useEffect(() => {
    if (!sdkSubscriptionClient) return

    const intervalId = setInterval(checkWebSocketStatus, 5000)
    return () => clearInterval(intervalId)
  }, [sdkSubscriptionClient, checkWebSocketStatus])

  return null
}

export default HyperLiquidInitializer
