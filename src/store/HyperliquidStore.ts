import { AGENT_PRIVATE_KEY, isTestnet } from '@/utils/constants'
import { IWebData2 } from '@/utils/hyperliquid/webData2Types'
import type { Hex, PrivateKeyAccount } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

interface PriceMap {
  [key: string]: number
}

interface HyperliquidState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sdk: any | null
  agentWallet: PrivateKeyAccount | null
  allMids: PriceMap
  clearingHouseState?: IWebData2['clearinghouseState']
  perpAssetContext: IWebData2['assetCtxs']
  spotAssetContext: IWebData2['spotAssetCtxs']
  spotState: IWebData2['spotState']
  openOrders: IWebData2['openOrders']
  isWebSocketConnected: boolean
  lastWebSocketUpdate: number
}

interface HyperliquidActions {
  initSdk: (address: Hex) => Promise<void>
  subscribeToAllMids: () => void
  unsubscribeFromAllMids: () => void
  subscribeWebData2: (address: Hex) => void
  unsubscribeWebData2: (address: Hex) => void
  checkWebSocketStatus: () => void
  getTimeSinceLastUpdate: () => string
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
    lastWebSocketUpdate: Date.now()
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
        set({ allMids: data })
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
          spotState: data.spotState,
          lastWebSocketUpdate: Date.now(),
          isWebSocketConnected: true
        })
      })
    },
    unsubscribeWebData2: (address: Hex) => {
      const sdk = get().sdk
      if (!sdk) return
      sdk.subscriptions.unsubscribeFromWebData2(address)
    },
    checkWebSocketStatus: () => {
      const currentTime = Date.now()
      const { lastWebSocketUpdate } = get()
      const timeSinceLastUpdate = currentTime - lastWebSocketUpdate

      // If no updates received in 10 seconds, consider connection lost
      set({ isWebSocketConnected: timeSinceLastUpdate < 10000 })
    },
    getTimeSinceLastUpdate: () => {
      const currentTime = Date.now()
      const { lastWebSocketUpdate } = get()
      const timeSinceLastUpdate = currentTime - lastWebSocketUpdate

      if (timeSinceLastUpdate < 1000) {
        return 'just now'
      } else if (timeSinceLastUpdate < 60000) {
        return `${Math.floor(timeSinceLastUpdate / 1000)}s ago`
      } else {
        return `${Math.floor(timeSinceLastUpdate / 60000)}m ago`
      }
    }
  })
)

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
      getTimeSinceLastUpdate: state.getTimeSinceLastUpdate
    }))
  )
}
