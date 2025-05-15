import { AGENT_PRIVATE_KEY, isTestnet } from '@/utils/constants'
import { IWebData2 } from '@/utils/hyperliquid/webData2Types'
import { Hex } from 'viem'
import { generatePrivateKey, privateKeyToAccount, type Account } from 'viem/accounts'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

interface PriceMap {
  [key: string]: number
}

interface HyperliquidState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sdk: any | null
  agentWallet: Account | null
  allMids: PriceMap
  clearingHouseState?: IWebData2['clearinghouseState']
  perpAssetContext: IWebData2['assetCtxs']
  spotAssetContext: IWebData2['spotAssetCtxs']
  spotState: IWebData2['spotState']
  openOrders: IWebData2['openOrders']
}

interface HyperliquidActions {
  initSdk: (address: Hex) => Promise<void>
  subscribeToAllMids: () => void
  unsubscribeFromAllMids: () => void
  subscribeWebData2: (address: Hex) => void
  unsubscribeWebData2: (address: Hex) => void
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
    openOrders: []
  },
  (set, get) => ({
    initSdk: async (address: Hex) => {
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
        set({
          clearingHouseState: data.clearinghouseState,
          openOrders: data.openOrders,
          perpAssetContext: data.assetCtxs,
          spotAssetContext: data.spotAssetCtxs,
          spotState: data.spotState
        })
      })
    },
    unsubscribeWebData2: (address: Hex) => {
      const sdk = get().sdk
      if (!sdk) return
      sdk.subscriptions.unsubscribeFromWebData2(address)
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
      unsubscribeWebData2: state.unsubscribeWebData2
    }))
  )
}

export const useHyperliquid = () => {
  return useHyperliquidStore(
    useShallow((state) => ({
      sdk: state.sdk,
      allMids: state.allMids,
      clearingHouseState: state.clearingHouseState,
      perpAssetContext: state.perpAssetContext,
      spotAssetContext: state.spotAssetContext,
      spotState: state.spotState,
      openOrders: state.openOrders
    }))
  )
}
