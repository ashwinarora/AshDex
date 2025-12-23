import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PrivyWagmiState {
  isUsingPrivy: boolean
  setIsUsingPrivy: (isUsingPrivy: boolean) => void
}

export const usePrivyWagmiStore = create<PrivyWagmiState>()(
  persist(
    (set) => ({
      isUsingPrivy: false,
      setIsUsingPrivy: (isUsingPrivy: boolean) => set({ isUsingPrivy })
    }),
    {
      name: 'privy-wagmi-store'
    }
  )
)

export default usePrivyWagmiStore
