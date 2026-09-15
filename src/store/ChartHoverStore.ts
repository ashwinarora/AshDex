import { create } from 'zustand'
import type { LwcCandle } from '@/components/Trading/Chart/toLwcBar'

interface ChartHoverState {
  focusedBar: LwcCandle | null
  setFocusedBar: (bar: LwcCandle | null) => void
}

export const useChartHoverStore = create<ChartHoverState>((set) => ({
  focusedBar: null,
  setFocusedBar: (bar) => set({ focusedBar: bar })
}))
