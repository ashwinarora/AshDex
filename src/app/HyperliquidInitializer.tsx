'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { zeroAddress } from 'viem'
import { useHyperLiquidStore } from '@/store/Hyperliquid'

export const HyperLiquidInitializer = () => {
  const { address } = useAccount()

  const {
    loadSdkScript,
    generateAgentWallet,
    initSdk,
    subscribeAllMids,
    subscribeWebData2,
    isSdkConnected
  } = useHyperLiquidStore((state) => ({
    loadSdkScript: state.loadSdkScript,
    generateAgentWallet: state.generateAgentWallet,
    initSdk: state.initSdk,
    subscribeAllMids: state.subscribeAllMids,
    subscribeWebData2: state.subscribeWebData2,
    isSdkConnected: state.isSdkConnected
  }))

  // 1. Load SDK script once
  useEffect(() => {
    loadSdkScript()
  }, [loadSdkScript])

  // 2. Generate / retrieve the agent's private key
  useEffect(() => {
    generateAgentWallet(address ?? zeroAddress)
  }, [generateAgentWallet, address])

  // 3. Initialize the SDK when script & key are ready
  useEffect(() => {
    initSdk(address)
  }, [initSdk, address])

  // 4. Once connected, subscribe to live data
  useEffect(() => {
    if (!isSdkConnected) return
    subscribeAllMids()
    subscribeWebData2(address)
  }, [isSdkConnected, subscribeAllMids, subscribeWebData2, address])

  return null
}
