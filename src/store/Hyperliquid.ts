import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { zeroAddress, type Hex, type PrivateKeyAccount } from 'viem'
import type { MetaData, SpotMeta } from '@/utils/hyperliquid/hyperLiquidTypes'
import type { IWebData2 } from '@/utils/hyperliquid/webData2Types'
import type { AxiosInstance } from 'axios'

interface HyperLiquidState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sdk: any
  isSdkScriptLoaded: boolean
  isSdkConnected: boolean
  allMids: Record<string, number>
  perpAssetContext: IWebData2['assetCtxs']
  spotAssetContext: IWebData2['spotAssetCtxs']
  spotState: IWebData2['spotState']
  clearingHouseState?: IWebData2['clearinghouseState']
  openOrders: IWebData2['openOrders']
  universe: MetaData[]
  spotMeta: SpotMeta
  isTestnet: boolean
  hyperliquidAxios: AxiosInstance
  privateKey?: Hex
  agentWallet?: PrivateKeyAccount
}

interface HyperLiquidActions {
  loadSdkScript: () => void
  generateAgentWallet: (address?: Hex) => void
  initSdk: (address?: Hex) => Promise<void>
  subscribeAllMids: () => void
  unsubscribeAllMids: () => void
  subscribeWebData2: (address?: Hex) => void
  unsubscribeWebData2: (address?: Hex) => void
}

type HyperLiquidStore = HyperLiquidState & HyperLiquidActions

export const useHyperLiquidStore = create<HyperLiquidStore>()(
  devtools((set, get: () => HyperLiquidStore) => {
    const isTestnet = process.env.NEXT_PUBLIC_HYPERLIQUID_NETWORK !== 'mainnet'

    let scriptTag: HTMLScriptElement | null = null

    return {
      // State
      sdk: null,
      isSdkScriptLoaded: false,
      isSdkConnected: false,
      allMids: {},
      perpAssetContext: [],
      spotAssetContext: [],
      spotState: { balances: [] },
      clearingHouseState: undefined,
      openOrders: [],
      universe: [],
      spotMeta: { tokens: [], universe: [] },
      isTestnet,
      privateKey: undefined,
      agentWallet: undefined,

      // Actions
      loadSdkScript: () => {
        if (scriptTag) return
        scriptTag = document.createElement('script')
        scriptTag.src = '/lib/hyperliquidSdk.js'
        scriptTag.async = true
        scriptTag.onload = () => set({ isSdkScriptLoaded: true })
        document.head.appendChild(scriptTag)
      },

      generateAgentWallet: (address?: Hex) => {
        if (!address) return
        const storageKey = `AGENT_PRIVATE_KEY_${address}`
        const stored = localStorage.getItem(storageKey)
        const priv = (stored || generatePrivateKey()) as Hex
        if (!stored) localStorage.setItem(storageKey, priv)
        const wallet = privateKeyToAccount(priv)
        set({ privateKey: priv, agentWallet: wallet })
      },

      initSdk: async (address?: Hex) => {
        const { isSdkScriptLoaded, privateKey, isTestnet } = get()
        if (!isSdkScriptLoaded) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const windowHyperliquid = (window as any).HyperliquidSDK
        if (!windowHyperliquid) return
        const config: {
          testnet: boolean
          enableWs: boolean
          walletAddress?: string
          privateKey?: string
          vaultAddress: string | null
        } = {
          testnet: isTestnet,
          enableWs: true,
          vaultAddress: null
        }
        if (address) {
          config.walletAddress = address
          if (privateKey) config.privateKey = privateKey
        }
        try {
          const sdkInstance = new windowHyperliquid.Hyperliquid(config)
          await sdkInstance.connect()
          set({ sdk: sdkInstance, isSdkConnected: true })
        } catch (err) {
          console.error('SDK connection error:', err)
        }
      },

      subscribeAllMids: () => {
        const sdk = get().sdk
        if (!sdk) return
        sdk.subscriptions.subscribeToAllMids((data: Record<string, number>) => {
          set({ allMids: data })
        })
      },
      unsubscribeAllMids: () => {
        const sdk = get().sdk
        if (!sdk) return
        sdk.subscriptions.unsubscribeFromAllMids()
      },

      subscribeWebData2: (address?: Hex) => {
        const sdk = get().sdk
        if (!sdk) return
        const user = address || zeroAddress
        sdk.subscriptions.subscribeToWebData2(user, (data: IWebData2) => {
          set({
            clearingHouseState: data.clearinghouseState,
            openOrders: data.openOrders,
            perpAssetContext: data.assetCtxs,
            spotAssetContext: data.spotAssetCtxs,
            spotState: data.spotState
          })
        })
      },
      unsubscribeWebData2: (address?: Hex) => {
        const sdk = get().sdk
        if (!sdk) return
        const user = address || zeroAddress
        sdk.subscriptions.unsubscribeFromWebData2(user)
      }
    }
  })
)
