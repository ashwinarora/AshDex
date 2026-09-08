import {
  AGENT_PRIVATE_KEY,
  isTestnet,
  WEBSOCKET_MAINNET_URL,
  WEBSOCKET_TESTNET_URL
} from '@/utils/constants'
import { zeroAddress, type Hex, type PrivateKeyAccount, Address, type WalletClient } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import * as hl from '@nktkas/hyperliquid'
import {
  removePendingWithdrawal,
  addPendingWithdrawal as addPendingWithdrawalToStorage,
  getPendingWithdrawals,
  type PendingWithdrawal
} from '@/utils/pendingWithdrawals'

interface HyperliquidState {
  userActiveAddress: Hex
  sdkTransport: hl.HttpTransport
  sdkSocketTransport: hl.WebSocketTransport
  sdkUserSignerClient: hl.ExchangeClient | null
  sdkL1ActionClient: hl.ExchangeClient | null
  sdkInfoClient: hl.InfoClient | null
  sdkSubscriptionClient: hl.SubscriptionClient | null
  agentWallet: PrivateKeyAccount | null
  allMids: hl.AllMidsResponse
  clearingHouseState: hl.WebData2WsEvent['clearinghouseState'] | null
  perpsMeta: hl.WebData2WsEvent['meta'] | null
  perpAssetContext: hl.WebData2WsEvent['assetCtxs']
  spotAssetContext: hl.WebData2WsEvent['spotAssetCtxs']
  spotState: NonNullable<hl.WebData2WsEvent['spotState']>
  openOrders: hl.WebData2WsEvent['openOrders']
  activeAssetData: hl.ActiveAssetDataWsEvent | null
  ledgerUpdates: hl.UserNonFundingLedgerUpdatesWsEvent['nonFundingLedgerUpdates']
  pendingWithdrawals: PendingWithdrawal[]
  isWebSocketConnected: boolean
  lastWebSocketUpdate: number
  lastUpdates: {
    allMids: number
    webData2: number
    candles: Record<string, number>
  }
  subsManager: {
    allMids?: hl.ISubscription
    webData2?: hl.ISubscription
    candles?: hl.ISubscription
    activeAssetData: hl.ISubscription[]
    ledgerUpdates?: hl.ISubscription
    assetCtxs?: hl.ISubscription
    spotAssetCtxs?: hl.ISubscription
  }
}

interface HyperliquidActions {
  initSdk: (address: Address, walletClient?: WalletClient) => Promise<void>
  fetchPerpsMeta: () => Promise<void>
  subscribeToAllMids: () => void
  unsubscribeFromAllMids: () => Promise<void>
  subscribeAssetCtxs: () => Promise<void>
  unsubscribeAssetCtxs: () => Promise<void>
  subscribeSpotAssetCtxs: () => Promise<void>
  unsubscribeSpotAssetCtxs: () => Promise<void>
  subscribeWebData2: (address: Hex) => void
  unsubscribeWebData2: () => Promise<void>
  pushNewOpenOrders: (orders: hl.WebData2WsEvent['openOrders']) => void
  pushNewPosition: (
    position: hl.WebData2WsEvent['clearinghouseState']['assetPositions'][number]
  ) => void
  subscribeToCandle: (
    asset: string,
    interval: hl.CandleWsParameters['interval'],
    callback: (data: hl.CandleWsEvent) => void
  ) => void
  unsubscribeFromCandle: (
    asset: string,
    interval: hl.CandleWsParameters['interval']
  ) => Promise<void>
  subscribeToActiveAssetData: (userActiveAddress: Hex, coinName: string) => void
  unsubscribeFromActiveAssetData: () => Promise<void>
  checkWebSocketStatus: () => void
  getTimeSinceLastUpdate: (channel?: 'allMids' | 'webData2' | 'candles') => string
  updateUserActiveAddress: (address: Hex) => void
  subscribeLedgerUpdates: (address: Hex) => void
  unsubscribeLedgerUpdates: () => Promise<void>
  addPendingWithdrawal: (withdrawal: PendingWithdrawal) => void
  loadPendingWithdrawals: (address: string) => void
  getFreshAgentWallet: (address: Address) => PrivateKeyAccount
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
    activeAssetData: null,
    ledgerUpdates: [],
    pendingWithdrawals: [],
    isWebSocketConnected: false,
    lastWebSocketUpdate: Date.now(),
    lastUpdates: {
      allMids: Date.now(),
      webData2: Date.now(),
      candles: {}
    },
    subsManager: {
      activeAssetData: []
    }
  },
  (set, get) => ({
    initSdk: async (address: Address, walletClient?: WalletClient) => {
      if (typeof window === 'undefined') return
      // Note: `HyperLiquidInitializer` intentionally calls this with `zeroAddress`
      // before the wallet is connected (to boot up public clients/subscriptions).
      // During wallet connect/disconnect transitions wagmi can briefly produce an
      // undefined address while `walletClient` updates, causing another
      // `initSdk(zeroAddress)` call that would otherwise overwrite `agentWallet`.

      // Always ensure non-user-specific clients exist.
      set((state) => ({
        sdkInfoClient: (state.sdkInfoClient ??
          new hl.InfoClient({
            transport: state.sdkTransport
          })) as hl.InfoClient,
        sdkSubscriptionClient: (state.sdkSubscriptionClient ??
          new hl.SubscriptionClient({
            transport: state.sdkSocketTransport
          })) as hl.SubscriptionClient,
        // Only set signer client when we actually have a walletClient.
        sdkUserSignerClient: walletClient
          ? (new hl.ExchangeClient({
              transport: state.sdkTransport,
              // @ts-expect-error wagmi WalletClient is compatible at runtime
              wallet: walletClient
            }) as hl.ExchangeClient)
          : state.sdkUserSignerClient
      }))

      // If we don't have a real user address yet, stop here (do NOT touch agentWallet).
      if (!address || address === zeroAddress) return

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
        sdkL1ActionClient: new hl.ExchangeClient({
          transport: state.sdkTransport,
          wallet: agentWallet
        })
        // `sdkInfoClient`/`sdkSubscriptionClient`/`sdkUserSignerClient` are handled above.
      }))
    },
    fetchPerpsMeta: async () => {
      const { sdkInfoClient } = get()
      if (!sdkInfoClient) return
      try {
        const meta = await sdkInfoClient.meta()
        set({ perpsMeta: meta as hl.WebData2WsEvent['meta'] })
      } catch (err) {
        console.error('[fetchPerpsMeta] failed', err)
      }
    },
    subscribeAssetCtxs: async () => {
      const { sdkSubscriptionClient } = get()
      if (!sdkSubscriptionClient) return
      const sub = await sdkSubscriptionClient.assetCtxs((data) => {
        set({
          perpAssetContext: data.ctxs as hl.WebData2WsEvent['assetCtxs'],
          lastWebSocketUpdate: Date.now(),
          isWebSocketConnected: true
        })
      })
      set((state) => ({
        subsManager: { ...state.subsManager, assetCtxs: sub }
      }))
    },
    unsubscribeAssetCtxs: async () => {
      const { subsManager } = get()
      if (!subsManager.assetCtxs) return
      await subsManager.assetCtxs.unsubscribe()
      set((state) => ({
        subsManager: { ...state.subsManager, assetCtxs: undefined }
      }))
    },
    subscribeSpotAssetCtxs: async () => {
      const { sdkSubscriptionClient } = get()
      if (!sdkSubscriptionClient) return
      const sub = await sdkSubscriptionClient.spotAssetCtxs((data) => {
        set({
          spotAssetContext: data.filter(
            (ctx) => Number(ctx.dayNtlVlm) > 0 || Number(ctx.prevDayPx) > 0
          ) as hl.WebData2WsEvent['spotAssetCtxs'],
          lastWebSocketUpdate: Date.now(),
          isWebSocketConnected: true
        })
      })
      set((state) => ({
        subsManager: { ...state.subsManager, spotAssetCtxs: sub }
      }))
    },
    unsubscribeSpotAssetCtxs: async () => {
      const { subsManager } = get()
      if (!subsManager.spotAssetCtxs) return
      await subsManager.spotAssetCtxs.unsubscribe()
      set((state) => ({
        subsManager: { ...state.subsManager, spotAssetCtxs: undefined }
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
    unsubscribeFromAllMids: async () => {
      const { subsManager } = get()
      if (!subsManager.allMids) return
      await subsManager.allMids.unsubscribe()
      set((state) => ({
        subsManager: {
          ...state.subsManager,
          allMids: undefined
        }
      }))
    },
    subscribeWebData2: async (address: Hex) => {
      const { sdkSubscriptionClient } = get()
      if (!sdkSubscriptionClient) return
      const webData2Sub = await sdkSubscriptionClient.webData2(
        {
          user: address
        },
        (data) => {
          const activeAddress = get().userActiveAddress
          if (data.user.toLowerCase() === activeAddress.toLowerCase()) {
            // Only user-scoped fields — asset ctxs and meta come from dedicated
            // subscriptions (assetCtxs / spotAssetCtxs) and an HTTP `meta()` fetch
            // so the UI works for logged-out users too.
            set({
              clearingHouseState: data.clearinghouseState,
              openOrders: data.openOrders,
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
    pushNewOpenOrders: (orders) => {
      set((state) => ({
        openOrders: [...state.openOrders, ...orders]
      }))
    },
    pushNewPosition: (position) => {
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
    unsubscribeWebData2: async () => {
      const { subsManager } = get()
      if (!subsManager.webData2) return
      await subsManager.webData2.unsubscribe()
      set((state) => ({
        subsManager: {
          ...state.subsManager,
          webData2: undefined
        }
      }))
    },
    subscribeToCandle: async (asset: string, interval, callback) => {
      const { sdkSubscriptionClient, subsManager } = get()
      if (!sdkSubscriptionClient) return

      const subscriptionKey = `${asset}-${interval}`

      // Unsubscribe from existing subscription if it exists
      if (subsManager.candles) {
        await subsManager.candles.unsubscribe()
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
    unsubscribeFromCandle: async (asset: string, interval) => {
      const { subsManager } = get()
      if (!subsManager.candles) return

      const subscriptionKey = `${asset}-${interval}`

      await subsManager.candles.unsubscribe()

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
    subscribeToActiveAssetData: async (userAddress: Hex, coinName: string) => {
      const { sdkSubscriptionClient } = get()
      if (!sdkSubscriptionClient) return
      if (userAddress === zeroAddress) return
      const activeAssetDataSub = await sdkSubscriptionClient.activeAssetData(
        {
          user: userAddress,
          coin: coinName
        },
        (data) => {
          set({ activeAssetData: data })
        }
      )
      set((state) => ({
        subsManager: {
          ...state.subsManager,
          activeAssetData: [...state.subsManager.activeAssetData, activeAssetDataSub]
        }
      }))
    },
    unsubscribeFromActiveAssetData: async () => {
      const { subsManager } = get()
      if (!subsManager.activeAssetData) return
      subsManager.activeAssetData.forEach((sub) => {
        sub.unsubscribe()
      })
      set((state) => ({
        subsManager: {
          ...state.subsManager,
          activeAssetData: []
        }
      }))
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
    },
    subscribeLedgerUpdates: async (address: Hex) => {
      const { sdkSubscriptionClient } = get()
      if (!sdkSubscriptionClient) return
      if (address === zeroAddress) return
      const ledgerUpdatesSub = await sdkSubscriptionClient.userNonFundingLedgerUpdates(
        { user: address },
        (data) => {
          const activeAddress = get().userActiveAddress
          if (data.user.toLowerCase() !== activeAddress.toLowerCase()) {
            ledgerUpdatesSub.unsubscribe()
            return
          }
          if (data.isSnapshot) {
            // Initial historical data
            set({ ledgerUpdates: data.nonFundingLedgerUpdates })
            // Clear any pending withdrawals that are now in the ledger
            data.nonFundingLedgerUpdates.forEach((update) => {
              if (update.delta.type === 'withdraw') {
                removePendingWithdrawal(data.user, update.time)
              }
            })
            // Reload pending withdrawals from localStorage to sync store state
            set({ pendingWithdrawals: getPendingWithdrawals(data.user) })
          } else {
            // Real-time update - prepend new items
            set((state) => ({
              ledgerUpdates: [...data.nonFundingLedgerUpdates, ...state.ledgerUpdates]
            }))
            // Clear pending withdrawal now that it's completed
            data.nonFundingLedgerUpdates.forEach((update) => {
              if (update.delta.type === 'withdraw') {
                removePendingWithdrawal(data.user, update.time)
              }
            })
            // Reload pending withdrawals from localStorage to sync store state
            set({ pendingWithdrawals: getPendingWithdrawals(data.user) })
          }
        }
      )
      set((state) => ({
        subsManager: {
          ...state.subsManager,
          ledgerUpdates: ledgerUpdatesSub
        }
      }))
    },
    unsubscribeLedgerUpdates: async () => {
      const { subsManager } = get()
      if (!subsManager.ledgerUpdates) return
      await subsManager.ledgerUpdates.unsubscribe()
      set((state) => ({
        subsManager: {
          ...state.subsManager,
          ledgerUpdates: undefined
        },
        ledgerUpdates: []
      }))
    },
    addPendingWithdrawal: (withdrawal: PendingWithdrawal) => {
      // Save to localStorage for persistence
      addPendingWithdrawalToStorage(withdrawal)
      // Update store for reactivity
      set((state) => ({
        pendingWithdrawals: [...state.pendingWithdrawals, withdrawal]
      }))
    },
    loadPendingWithdrawals: (address: string) => {
      // Load from localStorage into store
      const pending = getPendingWithdrawals(address)
      set({ pendingWithdrawals: pending })
    },
    getFreshAgentWallet: (address: Address) => {
      // Generate a new private key
      const newPrivateKey = generatePrivateKey()
      // Save to localStorage (overwriting any existing one)
      const storageKey = AGENT_PRIVATE_KEY + '_' + address
      localStorage.setItem(storageKey, newPrivateKey)
      // Create the new agent wallet
      const newAgentWallet = privateKeyToAccount(newPrivateKey)
      // Update the store
      set((state) => ({
        agentWallet: newAgentWallet,
        sdkL1ActionClient: new hl.ExchangeClient({
          transport: state.sdkTransport,
          wallet: newAgentWallet
        })
      }))
      return newAgentWallet
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
      sdkInfoClient: state.sdkInfoClient,
      initSdk: state.initSdk,
      fetchPerpsMeta: state.fetchPerpsMeta,
      subscribeToAllMids: state.subscribeToAllMids,
      unsubscribeFromAllMids: state.unsubscribeFromAllMids,
      subscribeAssetCtxs: state.subscribeAssetCtxs,
      unsubscribeAssetCtxs: state.unsubscribeAssetCtxs,
      subscribeSpotAssetCtxs: state.subscribeSpotAssetCtxs,
      unsubscribeSpotAssetCtxs: state.unsubscribeSpotAssetCtxs,
      subscribeWebData2: state.subscribeWebData2,
      unsubscribeWebData2: state.unsubscribeWebData2,
      subscribeToCandle: state.subscribeToCandle,
      unsubscribeFromCandle: state.unsubscribeFromCandle,
      checkWebSocketStatus: state.checkWebSocketStatus,
      getTimeSinceLastUpdate: state.getTimeSinceLastUpdate,
      updateUserActiveAddress: state.updateUserActiveAddress,
      subscribeLedgerUpdates: state.subscribeLedgerUpdates,
      unsubscribeLedgerUpdates: state.unsubscribeLedgerUpdates,
      loadPendingWithdrawals: state.loadPendingWithdrawals
    }))
  )
}
