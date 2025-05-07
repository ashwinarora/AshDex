'use client'
import React, { createContext, useState, ReactNode, useEffect, useMemo, useContext } from 'react'
import { useAccount } from 'wagmi'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { zeroAddress, type Hex, type PrivateKeyAccount } from 'viem'
import type { AxiosInstance } from 'axios'
import { useQuery } from '@tanstack/react-query'
import { MetaData, SpotMeta } from '@/utils/hyperliquid/hyperLiquidTypes'
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
  universe: MetaData[]
  clearingHouseState?: IWebData2['clearinghouseState']
  openOrders: IWebData2['openOrders']
  perpAssetContext: IWebData2['assetCtxs']
  spotAssetContext: IWebData2['spotAssetCtxs']
  spotState: IWebData2['spotState']
  spotMeta: SpotMeta
  isTestnet: boolean
}

const initialValue: HyperLiquidContextProps = {
  sdk: null,
  isSdkConnected: false,
  allMids: {},
  agentWallet: undefined,
  hyperliquidAxios: mainnetAxios,
  universe: [],
  clearingHouseState: undefined,
  openOrders: [],
  perpAssetContext: [],
  spotAssetContext: [],
  spotState: {
    balances: []
  },
  spotMeta: {
    tokens: [],
    universe: []
  },
  isTestnet: true
}

const HyperLiquidContext = createContext<HyperLiquidContextProps>(initialValue)

export interface PriceMap {
  [key: string]: number
}

export const HyperLiquidProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address } = useAccount()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sdk, setSdk] = useState<any>()
  const [isSdkScriptLoaded, setIsSdkScriptLoaded] = useState(false)
  const [isSdkConnected, setIsSdkConnected] = useState(false)
  const [allMids, setAllMids] = useState<PriceMap>({})
  const [perpAssetContext, setPerpAssetContext] = useState<IWebData2['assetCtxs']>([])
  const [spotAssetContext, setSpotAssetContext] = useState<IWebData2['spotAssetCtxs']>([])
  const [spotState, setSpotState] = useState<IWebData2['spotState']>(initialValue.spotState)
  const [clearingHouseState, setClearingHouseState] = useState<IWebData2['clearinghouseState']>()
  const [openOrders, setOpenOrders] = useState<IWebData2['openOrders']>([])

  const isTestnet = useMemo(() => {
    if (process.env.NEXT_PUBLIC_HYPERLIQUID_NETWORK === 'mainnet') return false
    return true
  }, [])

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

  const { data: universe } = useQuery({
    queryKey: ['universe', isTestnet],
    queryFn: async () => {
      const res = await sdk.info.perpetuals.getMeta()
      return res.universe as MetaData[]
    },
    enabled: !!sdk || !!isSdkConnected,
    initialData: []
  })

  const { data: spotMeta } = useQuery({
    queryKey: ['spotUniverse', isTestnet],
    queryFn: async () => {
      const res = await sdk.info.spot.getSpotMeta()
      return res as SpotMeta
    },
    enabled: !!sdk || !!isSdkConnected,
    initialData: {
      tokens: [],
      universe: []
    }
  })

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
      try {
        // throw new Error('Simulated SDK failure')
        const sdkInstance = new windowHyperliquid.Hyperliquid(config)
        await sdkInstance.connect()
        setSdk(sdkInstance)
        setIsSdkConnected(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('SDK connection error:', err)
      }
    }
    initSdk()
  }, [isSdkScriptLoaded, privateKey, address, isTestnet])

  useEffect(() => {
    if (!sdk) return
    sdk.subscriptions.subscribeToAllMids((data: PriceMap) => {
      // console.log('allMids', data)
      setAllMids(data)
    })
    return () => {
      sdk.subscriptions.unsubscribeFromAllMids()
    }
  }, [sdk])

  useEffect(() => {
    if (!sdk) return
    const userAddress = address ? address : zeroAddress
    console.log('Subscribing to fills')
    sdk.subscriptions.subscribeToWebData2(userAddress, (data: IWebData2) => {
      const { clearinghouseState, assetCtxs, spotAssetCtxs, spotState, openOrders } = data
      setClearingHouseState(clearinghouseState)
      setOpenOrders(openOrders)
      setPerpAssetContext(assetCtxs)
      setSpotAssetContext(spotAssetCtxs)
      setSpotState(spotState)
    })
    return () => {
      sdk.subscriptions.unsubscribeFromWebData2()
    }
  }, [sdk, address])

  useEffect(() => {
    console.log('spotMeta:', spotMeta)
    console.log('spotAssetContext:', spotAssetContext)
  }, [spotMeta, spotAssetContext])

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
        openOrders,
        perpAssetContext,
        spotAssetContext,
        spotState,
        spotMeta,
        isTestnet
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
