import { create } from 'zustand'

export type OrderTab = 'LIMIT' | 'MARKET' | 'SCALE' | 'STOP_LIMIT' | 'STOP_MARKET'

interface TradeUIState {
  activeOrderTab: OrderTab
  setActiveOrderTab: (tab: OrderTab) => void

  requestedLimitPrice: string | null
  setRequestedLimitPrice: (price: string) => void
  clearRequestedLimitPrice: () => void

  requestedAssetAmount: string | null
  setRequestedAssetAmount: (amount: string) => void
  clearRequestedAssetAmount: () => void
}

export const useTradeUIStore = create<TradeUIState>((set) => ({
  activeOrderTab: 'MARKET',
  setActiveOrderTab: (tab: OrderTab) => set({ activeOrderTab: tab }),

  requestedLimitPrice: null,
  setRequestedLimitPrice: (price: string) => set({ requestedLimitPrice: price }),
  clearRequestedLimitPrice: () => set({ requestedLimitPrice: null }),

  requestedAssetAmount: null,
  setRequestedAssetAmount: (amount: string) => set({ requestedAssetAmount: amount }),
  clearRequestedAssetAmount: () => set({ requestedAssetAmount: null })
}))

export default useTradeUIStore
