import {
  AGENT_PRIVATE_KEY,
  isTestnet,
  WEBSOCKET_MAINNET_URL,
  WEBSOCKET_TESTNET_URL
} from '@/utils/constants'
import { type WalletClient, zeroAddress, type Hex, type PrivateKeyAccount } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import * as hl from '@nktkas/hyperliquid'

interface HyperliquidState {
  userActiveAddress: Hex
  sdkTransport: hl.HttpTransport
  sdkSocketTransport: hl.WebSocketTransport
  sdkUserSignerClient: hl.ExchangeClient | null
  sdkL1ActionClient: hl.ExchangeClient | null
  sdkInfoClient: hl.InfoClient | null
  sdkSubscriptionClient: hl.SubscriptionClient | null
  agentWallet: PrivateKeyAccount | null
  allMids: hl.AllMids
  clearingHouseState: hl.PerpsClearinghouseState | null
  perpsMeta: hl.PerpsMeta | null
  perpAssetContext: hl.PerpsAssetCtx[]
  spotAssetContext: hl.SpotAssetCtx[]
  spotState: hl.SpotClearinghouseState
  openOrders: hl.FrontendOrder[]
  isWebSocketConnected: boolean
  lastWebSocketUpdate: number
  lastUpdates: {
    allMids: number
    webData2: number
    candles: Record<string, number>
  }
  subsManager: {
    allMids?: hl.Subscription
    webData2?: hl.Subscription
    candles?: hl.Subscription
  }
}

interface HyperliquidActions {
  initSdk: (address: Hex, walletClient?: WalletClient) => Promise<void>
  subscribeToAllMids: () => void
  unsubscribeFromAllMids: () => void
  subscribeWebData2: (address: Hex) => void
  unsubscribeWebData2: (address: Hex) => void
  pushNewOpenOrders: (orders: hl.FrontendOrder[]) => void
  pushNewPosition: (position: hl.AssetPosition) => void
  subscribeToCandle: (
    asset: string,
    interval: hl.EventCandleParameters['interval'],
    callback: (data: hl.Candle) => void
  ) => void
  unsubscribeFromCandle: (asset: string, interval: hl.EventCandleParameters['interval']) => void
  checkWebSocketStatus: () => void
  getTimeSinceLastUpdate: (channel?: 'allMids' | 'webData2' | 'candles') => string
  updateUserActiveAddress: (address: Hex) => void
}

const store = combine<HyperliquidState, HyperliquidActions>(
  {
    userActiveAddress: zeroAddress,
    sdkTransport: new hl.HttpTransport({
      isTestnet: isTestnet
    }),
    sdkSocketTransport: new hl.WebSocketTransport({
      url: isTestnet ? WEBSOCKET_TESTNET_URL : WEBSOCKET_MAINNET_URL
    }),
    sdkUserSignerClient: null,
    sdkL1ActionClient: null,
    sdkInfoClient: null,
    sdkSubscriptionClient: null,
    agentWallet: null,
    allMids: {},
    clearingHouseState: null,
    perpsMeta: null,
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
    },
    subsManager: {}
  },
  (set, get) => ({
    initSdk: async (address: Hex, walletClient?: WalletClient) => {
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

      set((state) => ({
        agentWallet: agentWallet,
        sdkUserSignerClient: walletClient
          ? new hl.ExchangeClient({
              transport: state.sdkTransport,
              wallet: walletClient,
              isTestnet: isTestnet
            })
          : null,
        sdkL1ActionClient: new hl.ExchangeClient({
          transport: state.sdkTransport,
          wallet: agentWallet,
          isTestnet: isTestnet
        }),
        sdkInfoClient: new hl.InfoClient({
          transport: state.sdkTransport
        }),
        sdkSubscriptionClient: new hl.SubscriptionClient({
          transport: state.sdkSocketTransport
        })
      }))
    },
    subscribeToAllMids: async () => {
      const { sdkSubscriptionClient } = get()
      if (!sdkSubscriptionClient) return
      const allMidsSub = await sdkSubscriptionClient.allMids((data) => {
        set({
          allMids: data.mids,
          lastUpdates: {
            ...get().lastUpdates,
            allMids: Date.now()
          }
        })
      })
      set((state) => ({
        subsManager: {
          ...state.subsManager,
          allMids: allMidsSub
        }
      }))
    },
    unsubscribeFromAllMids: () => {
      const { subsManager } = get()
      if (!subsManager.allMids) return
      subsManager.allMids.unsubscribe()
    },
    subscribeWebData2: async (address: Hex) => {
      const { sdkSubscriptionClient, userActiveAddress } = get()
      if (!sdkSubscriptionClient) return
      const webData2Sub = await sdkSubscriptionClient.webData2(
        {
          user: address
        },
        (data) => {
          console.log('webdata2', data)
          if (data.user.toLowerCase() === userActiveAddress.toLowerCase()) {
            set({
              clearingHouseState: data.clearinghouseState,
              openOrders: data.openOrders,
              perpsMeta: data.meta,
              perpAssetContext: data.assetCtxs,
              spotAssetContext: data.spotAssetCtxs.filter((ctx) => {
                return Number(ctx.dayNtlVlm) > 0 || Number(ctx.prevDayPx) > 0
              }),
              spotState: data.spotState,
              lastWebSocketUpdate: Date.now(),
              isWebSocketConnected: true,
              lastUpdates: {
                ...get().lastUpdates,
                webData2: Date.now()
              }
            })
          } else {
            // Useful to confirm unsub when address mismatch
            console.log('WEBDATA2 ADDRESS MISMATCH')
            webData2Sub.unsubscribe()
          }
        }
      )
      set((state) => ({
        subsManager: {
          ...state.subsManager,
          webData2: webData2Sub
        }
      }))
    },
    pushNewOpenOrders: (orders: hl.FrontendOrder[]) => {
      set((state) => ({
        openOrders: [...state.openOrders, ...orders]
      }))
    },
    pushNewPosition: (position: hl.AssetPosition) => {
      console.log('pushing position', position)
      set((state) => {
        if (!state.clearingHouseState) {
          return state // Don't update if clearingHouseState is null
        }
        return {
          clearingHouseState: {
            ...state.clearingHouseState,
            assetPositions: [...state.clearingHouseState.assetPositions, position]
          }
        }
      })
    },
    unsubscribeWebData2: () => {
      const { subsManager } = get()
      if (!subsManager.webData2) return
      subsManager.webData2.unsubscribe()
    },
    subscribeToCandle: async (
      asset: string,
      interval: hl.EventCandleParameters['interval'],
      callback: (data: hl.Candle) => void
    ) => {
      const { sdkSubscriptionClient, subsManager } = get()
      if (!sdkSubscriptionClient) return

      const subscriptionKey = `${asset}-${interval}`

      // Unsubscribe from existing subscription if it exists
      if (subsManager.candles) {
        subsManager.candles.unsubscribe()
      }

      const candleSub = await sdkSubscriptionClient.candle(
        {
          coin: asset,
          interval: interval
        },
        (data) => {
          callback(data)
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
      )

      set((state) => ({
        subsManager: {
          ...state.subsManager,
          candles: candleSub
        }
      }))
    },
    unsubscribeFromCandle: (asset: string, interval: hl.EventCandleParameters['interval']) => {
      const { subsManager } = get()
      if (!subsManager.candles) return

      const subscriptionKey = `${asset}-${interval}`

      subsManager.candles.unsubscribe()

      set((state) => {
        const remainingCandles = { ...state.lastUpdates.candles }
        delete remainingCandles[subscriptionKey]
        return {
          lastUpdates: {
            ...state.lastUpdates,
            candles: remainingCandles
          },
          subsManager: {
            ...state.subsManager,
            candles: undefined
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
    },
    updateUserActiveAddress: (address: Hex) => {
      set({ userActiveAddress: address })
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

export const useHyperliquidStore = create(store)

export const useInitHyperliquid = () => {
  return useHyperliquidStore(
    useShallow((state) => ({
      sdkSubscriptionClient: state.sdkSubscriptionClient,
      initSdk: state.initSdk,
      subscribeToAllMids: state.subscribeToAllMids,
      unsubscribeFromAllMids: state.unsubscribeFromAllMids,
      subscribeWebData2: state.subscribeWebData2,
      unsubscribeWebData2: state.unsubscribeWebData2,
      subscribeToCandle: state.subscribeToCandle,
      unsubscribeFromCandle: state.unsubscribeFromCandle,
      checkWebSocketStatus: state.checkWebSocketStatus,
      getTimeSinceLastUpdate: state.getTimeSinceLastUpdate,
      updateUserActiveAddress: state.updateUserActiveAddress
    }))
  )
}
