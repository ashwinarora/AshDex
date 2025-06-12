import { AGENT_PRIVATE_KEY, isTestnet } from '@/utils/constants'
import { IWebData2, SpotAssetCtx } from '@/utils/hyperliquid/webData2Types'
import type { Hex, PrivateKeyAccount } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import { Candle, WsBook, HistoricOrder, SpotMeta } from '@/utils/hyperliquid/hyperLiquidTypes'

interface TokenDetails {
  name: string
  symbol: string
  decimals: number
  address: string
  volume?: number
  funding?: number
}

interface PriceMap {
  [key: string]: number
}

interface HyperliquidState {
  sdk: {
    subscriptions: {
      subscribeToAllMids: (callback: (data: Record<string, number>) => void) => void
      unsubscribeFromAllMids: () => void
      subscribeToWebData2: (address: Hex, callback: (data: IWebData2) => void) => void
      unsubscribeFromWebData2: (address: Hex) => void
      subscribeToCandle: (
        asset: string,
        interval: string,
        callback: (data: Candle[] | Candle) => void
      ) => void
      unsubscribeFromCandle: (asset: string, interval: string) => void
      subscribeToL2Book: (
        asset: string,
        nSigFigs: number,
        mantissa: number | null,
        callback: (data: WsBook) => void
      ) => void
      unsubscribeFromL2Book: (asset: string, nSigFigs: number, mantissa: number | null) => void
    }
    info: {
      getCandleSnapshot: (
        asset: string,
        interval: string,
        from: number,
        to: number
      ) => Promise<Candle[]>
      spot: {
        getSpotMetaAndAssetCtxs: () => Promise<[SpotMeta, SpotAssetCtx[]]>
        getTokenDetails: (tokenId: string) => Promise<TokenDetails>
        getSpotMeta: () => Promise<SpotMeta>
      }
      perpetuals: {
        getMetaAndAssetCtxs: () => Promise<
          [{ universe: { name?: string }[] }, { dayNtlVlm?: number; funding?: number }[]]
        >
        getMeta: () => Promise<{ universe: { name?: string }[] }>
      }
      getHistoricalOrders: (address: Hex) => Promise<HistoricOrder[]>
    }
    exchange: {
      cancelOrder: (
        params: { coin: string; o: number } | Array<{ coin: string; o: number }>
      ) => Promise<void>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateLeverage: (coin: string, type: string, value: number) => Promise<any>
      setReferrer: (code: string) => Promise<{ status: string }>
      placeTwapOrder: (params: {
        coin: string
        is_buy: boolean
        sz: number
        minutes: number
        randomize: boolean
        reduce_only: boolean
      }) => Promise<unknown>
      updateIsolatedMargin: (coin: string, isBuy: boolean, amount: number) => Promise<unknown>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      usdTransfer: (destination: string, amount: number) => Promise<any>
    }
    connect: () => Promise<void>
  } | null
  agentWallet: PrivateKeyAccount | null
  allMids: PriceMap
  clearingHouseState?: IWebData2['clearinghouseState']
  perpAssetContext: IWebData2['assetCtxs']
  spotAssetContext: IWebData2['spotAssetCtxs']
  spotState: IWebData2['spotState']
  openOrders: IWebData2['openOrders']
  isWebSocketConnected: boolean
  lastWebSocketUpdate: number
  lastUpdates: {
    allMids: number
    webData2: number
    candles: Record<string, number>
  }
}

interface HyperliquidActions {
  initSdk: (address: Hex) => Promise<void>
  subscribeToAllMids: () => void
  unsubscribeFromAllMids: () => void
  subscribeWebData2: (address: Hex) => void
  unsubscribeWebData2: (address: Hex) => void
  subscribeToCandle: (
    asset: string,
    interval: string,
    callback: (data: Candle[] | Candle) => void
  ) => void
  unsubscribeFromCandle: (asset: string, interval: string) => void
  checkWebSocketStatus: () => void
  getTimeSinceLastUpdate: (channel?: 'allMids' | 'webData2' | 'candles') => string
}

const store = combine<HyperliquidState, HyperliquidActions>(
  {
    sdk: null,
    agentWallet: null,
    allMids: {},
    clearingHouseState: undefined,
    perpAssetContext: [],
    spotAssetContext: [],
    spotState: { balances: [] },
    openOrders: [],
    isWebSocketConnected: false,
    lastWebSocketUpdate: Date.now(),
    lastUpdates: {
      allMids: Date.now(),
      webData2: Date.now(),
      candles: {}
    }
  },
  (set, get) => ({
    initSdk: async (address: Hex) => {
      if (typeof window === 'undefined') return
      if (!address) return
      const privateKey = (() => {
        const storageKey = AGENT_PRIVATE_KEY + '_' + address
        const storedPrivateKey = localStorage.getItem(storageKey)
        if (storedPrivateKey) {
          return storedPrivateKey as Hex
        } else {
          const newPrivateKey = generatePrivateKey()
          localStorage.setItem(storageKey, newPrivateKey)
          return newPrivateKey
        }
      })()

      const agentWallet = privateKeyToAccount(privateKey)
      set({ agentWallet: agentWallet })

      const script = document.createElement('script')
      script.src = '/lib/hyperliquidSdk.js'
      script.async = true
      script.onload = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const windowHyperliquid = (window as any).HyperliquidSDK
        if (!windowHyperliquid) return
        try {
          const sdkInstance = new windowHyperliquid.Hyperliquid({
            testnet: isTestnet,
            enableWs: true,
            privateKey: privateKey,
            walletAddress: address,
            vaultAddress: null
          })
          await sdkInstance.connect()
          set({ sdk: sdkInstance })
        } catch (err) {
          console.error('SDK connection error:', err)
        }
      }
      document.head.appendChild(script)
    },
    subscribeToAllMids: () => {
      const sdk = get().sdk
      if (!sdk) return
      sdk.subscriptions.subscribeToAllMids((data: Record<string, number>) => {
        set({
          allMids: data,
          lastUpdates: {
            ...get().lastUpdates,
            allMids: Date.now()
          }
        })
      })
    },
    unsubscribeFromAllMids: () => {
      const sdk = get().sdk
      if (!sdk) return
      sdk.subscriptions.unsubscribeFromAllMids()
    },
    subscribeWebData2: (address: Hex) => {
      const sdk = get().sdk
      if (!sdk) return
      sdk.subscriptions.subscribeToWebData2(address, (data: IWebData2) => {
        console.log('webdata2', data)
        set({
          clearingHouseState: data.clearinghouseState,
          openOrders: data.openOrders,
          perpAssetContext: data.assetCtxs,
          spotAssetContext: data.spotAssetCtxs,
          // HACK: Replace PERP with SPOT in the coin name. This is because SDK is buggy and returns PERP instead of SPOT.
          spotState: {
            ...data.spotState,
            balances: data.spotState?.balances.map((asset) => ({
              ...asset,
              coin: asset.coin.replace('PERP', 'SPOT')
            }))
          },
          lastWebSocketUpdate: Date.now(),
          isWebSocketConnected: true,
          lastUpdates: {
            ...get().lastUpdates,
            webData2: Date.now()
          }
        })
      })
    },
    unsubscribeWebData2: (address: Hex) => {
      const sdk = get().sdk
      if (!sdk) return
      sdk.subscriptions.unsubscribeFromWebData2(address)
    },
    subscribeToCandle: (
      asset: string,
      interval: string,
      callback: (data: Candle[] | Candle) => void
    ) => {
      const sdk = get().sdk
      if (!sdk) return

      const subscriptionKey = `${asset}-${interval}`

      const candleHandler = (payload: Candle[] | Candle) => {
        callback(payload)
        set((state) => ({
          lastUpdates: {
            ...state.lastUpdates,
            candles: {
              ...state.lastUpdates.candles,
              [subscriptionKey]: Date.now()
            }
          }
        }))
      }

      sdk.subscriptions.subscribeToCandle(asset, interval, candleHandler)
    },
    unsubscribeFromCandle: (asset: string, interval: string) => {
      const sdk = get().sdk
      if (!sdk) return

      const subscriptionKey = `${asset}-${interval}`
      sdk.subscriptions.unsubscribeFromCandle(asset, interval)

      set((state) => {
        const remainingCandles = { ...state.lastUpdates.candles }
        delete remainingCandles[subscriptionKey]
        return {
          lastUpdates: {
            ...state.lastUpdates,
            candles: remainingCandles
          }
        }
      })
    },
    checkWebSocketStatus: () => {
      const currentTime = Date.now()
      const { lastUpdates } = get()
      const timeSinceLastUpdate = Math.min(
        currentTime - lastUpdates.allMids,
        currentTime - lastUpdates.webData2,
        ...Object.values(lastUpdates.candles).map((time) => currentTime - time)
      )

      // If no updates received in 10 seconds, consider connection lost
      set({ isWebSocketConnected: timeSinceLastUpdate < 10000 })
    },
    getTimeSinceLastUpdate: (channel?: 'allMids' | 'webData2' | 'candles') => {
      const currentTime = Date.now()
      const { lastUpdates } = get()

      if (channel === 'candles') {
        // Return the most recent candle update
        const candleTimes = Object.values(lastUpdates.candles)
        if (candleTimes.length === 0) return 'No candle data'
        const mostRecentCandle = Math.max(...candleTimes)
        const timeSinceLastUpdate = currentTime - mostRecentCandle
        return formatTimeSinceUpdate(timeSinceLastUpdate)
      }

      const timeSinceLastUpdate = channel
        ? currentTime - lastUpdates[channel]
        : Math.min(
            currentTime - lastUpdates.allMids,
            currentTime - lastUpdates.webData2,
            ...Object.values(lastUpdates.candles).map((time) => currentTime - time)
          )

      return formatTimeSinceUpdate(timeSinceLastUpdate)
    }
  })
)

// Helper function to format time since update
const formatTimeSinceUpdate = (timeSinceLastUpdate: number): string => {
  if (timeSinceLastUpdate < 1000) {
    return timeSinceLastUpdate + 'ms ago'
  } else if (timeSinceLastUpdate < 60000) {
    return `${Math.floor(timeSinceLastUpdate / 1000)}s ago`
  } else {
    return `${Math.floor(timeSinceLastUpdate / 60000)}m ago`
  }
}

const useHyperliquidStore = create(store)

export const useInitHyperliquid = () => {
  return useHyperliquidStore(
    useShallow((state) => ({
      initSdk: state.initSdk,
      sdk: state.sdk,
      subscribeToAllMids: state.subscribeToAllMids,
      unsubscribeFromAllMids: state.unsubscribeFromAllMids,
      subscribeWebData2: state.subscribeWebData2,
      unsubscribeWebData2: state.unsubscribeWebData2,
      subscribeToCandle: state.subscribeToCandle,
      unsubscribeFromCandle: state.unsubscribeFromCandle,
      checkWebSocketStatus: state.checkWebSocketStatus,
      getTimeSinceLastUpdate: state.getTimeSinceLastUpdate
    }))
  )
}

export const useHyperliquid = () => {
  return useHyperliquidStore(
    useShallow((state) => ({
      sdk: state.sdk,
      agentWallet: state.agentWallet,
      allMids: state.allMids,
      clearingHouseState: state.clearingHouseState,
      perpAssetContext: state.perpAssetContext,
      spotAssetContext: state.spotAssetContext,
      spotState: state.spotState,
      openOrders: state.openOrders,
      isWebSocketConnected: state.isWebSocketConnected,
      getTimeSinceLastUpdate: state.getTimeSinceLastUpdate,
      subscribeToCandle: state.subscribeToCandle,
      unsubscribeFromCandle: state.unsubscribeFromCandle
    }))
  )
}
