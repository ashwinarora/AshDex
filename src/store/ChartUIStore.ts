import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { IntervalType } from '@/components/Trading/Chart/ChartTypes'
import { INTERVALS } from '@/components/Trading/Chart/ChartTypes'

interface ChartUIState {
  selectedInterval: IntervalType
  setSelectedInterval: (interval: IntervalType) => void
}

const isValidInterval = (v: unknown): v is IntervalType =>
  typeof v === 'string' && (INTERVALS as readonly string[]).includes(v)

export const useChartUIStore = create<ChartUIState>()(
  persist(
    (set) => ({
      selectedInterval: '60',
      setSelectedInterval: (interval) => set({ selectedInterval: interval })
    }),
    {
      name: 'chart-ui',
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ChartUIState>
        return {
          ...current,
          selectedInterval: isValidInterval(p.selectedInterval)
            ? p.selectedInterval
            : current.selectedInterval
        }
      }
    }
  )
)
