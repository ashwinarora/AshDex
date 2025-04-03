'use client'
import React, { createContext, useState, ReactNode, useEffect, useMemo, useContext } from 'react'
import { useAccount } from 'wagmi'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import type { Hex, PrivateKeyAccount } from 'viem'
import type { AxiosInstance } from 'axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IClearingHouseState, MetaData } from '@/utils/hyperliquid/hyperLiquidTypes'
import { AGENT_PRIVATE_KEY } from '@/utils/constants'
import { mainnetAxios, testnetAxios } from '@/config/axios'
import { IWebData2 } from '@/utils/hyperliquid/webData2Types'

interface HyperLiquidContextProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sdk: any
  isSdkConnected: boolean
  allMids: PriceMap
  agentWallet?: PrivateKeyAccount
  hyperliquidAxios: AxiosInstance
  universe?: MetaData[]
  clearingHouseState?: IClearingHouseState
  isTestnet: boolean
}

const initialValue = {
  sdk: null,
  isSdkConnected: false,
  allMids: {},
  agentWallet: undefined,
  hyperliquidAxios: mainnetAxios,
  universe: undefined,
  clearingHouseState: undefined,
  isTestnet: true,
}

const HyperLiquidContext = createContext<HyperLiquidContextProps>(initialValue)

export interface PriceMap {
  [key: string]: number
}

export const HyperLiquidProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address, chain } = useAccount()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sdk, setSdk] = useState<any>()
  const [isSdkScriptLoaded, setIsSdkScriptLoaded] = useState(false)
  const [isSdkConnected, setIsSdkConnected] = useState(false)
  const [allMids, setAllMids] = useState<PriceMap>({})
  const queryClient = useQueryClient()

  const privateKey = useMemo(() => {
    if (!address) return
    const storageKey = AGENT_PRIVATE_KEY + '_' + address
    const storedPrivateKey = localStorage.getItem(storageKey)
    if (storedPrivateKey) {
      return storedPrivateKey as Hex
    } else {
      const newPrivateKey = generatePrivateKey()
      localStorage.setItem(storageKey, newPrivateKey)
      return newPrivateKey
    }
  }, [address])

  const agentWallet = useMemo(() => {
    if (!privateKey) return
    return privateKeyToAccount(privateKey)
  }, [privateKey])

  const { data: clearingHouseState } = useQuery<IClearingHouseState>({
    queryKey: ['clearingHouseState', address],
    queryFn: async () => {
      const res = await sdk.info.perpetuals.getClearinghouseState(address)
      return res
    },
    enabled: !!sdk || !!isSdkConnected
  })

  const { data: universe } = useQuery({
    queryKey: ['universe', chain?.id],
    queryFn: async () => {
      const res = await sdk.info.perpetuals.getMeta()
      return res.universe as MetaData[]
    },
    enabled: !!sdk || !!isSdkConnected
  })

  const isTestnet = useMemo(() => {
    return true // update this code when ready for mainnet
  }, [])

  const hyperliquidAxios = useMemo(() => (isTestnet ? testnetAxios : mainnetAxios), [isTestnet])

  // effect to load the Hyperliquid SDK
  useEffect(() => {
    const script = document.createElement('script')
    // script.src = "https://unpkg.com/hyperliquid/dist/browser.global.js";
    script.src = '/lib/hyperliquidSdk.js'
    script.async = true

    script.onload = async () => {
      setIsSdkScriptLoaded(true)
    }

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
      setIsSdkScriptLoaded(false)
    }
  }, [])

  useEffect(() => {
    const initSdk = async () => {
      if (!isSdkScriptLoaded) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const windowHyperliquid = (window as any).HyperliquidSDK
      if (!windowHyperliquid) return
      const config: {
        testnet: boolean
        enableWs: boolean
        walletAddress?: string
        privateKey?: string
      } = {
        testnet: isTestnet,
        enableWs: true
      }
      if (address) {
        config.walletAddress = address
        if (privateKey) {
          config.privateKey = privateKey
        }
      }
      const sdkInstance = new windowHyperliquid.Hyperliquid(config)
      await sdkInstance.connect()
      setSdk(sdkInstance)
      setIsSdkConnected(true)
    }
    initSdk()
  }, [isSdkScriptLoaded, privateKey, address, isTestnet])

  useEffect(() => {
    if (!sdk) return
    sdk.subscriptions.subscribeToAllMids((data: PriceMap) => {
      setAllMids(data)
    })
    return () => {
      sdk.subscriptions.unsubscribeFromAllMids()
    }
  }, [sdk])

  useEffect(() => {
    if (!sdk) return
    if (!address) return
    console.log('Subscribing to fills')
    sdk.subscriptions.subscribeToWebData2(address, (data: IWebData2) => {
      const { clearinghouseState } = data
      queryClient.setQueryData(['clearingHouseState', address], clearinghouseState)
    })
    return () => {
      sdk.subscriptions.unsubscribeFromWebData2()
    }
  }, [sdk, address, queryClient])

  return (
    <HyperLiquidContext.Provider
      value={{
        sdk,
        isSdkConnected,
        allMids,
        agentWallet,
        hyperliquidAxios,
        universe,
        clearingHouseState,
        isTestnet,
      }}
    >
      {children}
    </HyperLiquidContext.Provider>
  )
}

export const useHyperLiquid = (): HyperLiquidContextProps => {
  const context = useContext(HyperLiquidContext)
  if (!context) {
    throw new Error('useHyperLiquid must be used within a HyperLiquidProvider')
  }
  return context
}
