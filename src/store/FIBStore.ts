import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface FIBState {
  isEmbeddedInFIBApp: boolean
  isAuthenticated: boolean
  lastPaymentId?: string
  lastPaymentStatus?: 'success' | 'failed'
  ssoAuthorizationCode?: string
  userDetails?: unknown
  // Actions
  setEmbedded: (embedded: boolean) => void
  setAuthenticated: (authenticated: boolean) => void
  setPaymentResult: (
    transactionId: string | undefined,
    status: 'success' | 'failed' | undefined
  ) => void
  setSsoAuthorizationCode: (code: string | undefined) => void
  setUserDetails: (details: unknown) => void
  reset: () => void
}

export const useFIBStore = create<FIBState>()(
  persist(
    (set) => ({
      isEmbeddedInFIBApp: false,
      isAuthenticated: false,
      lastPaymentId: undefined,
      lastPaymentStatus: undefined,
      ssoAuthorizationCode: undefined,
      userDetails: undefined,
      setEmbedded: (embedded: boolean) => set({ isEmbeddedInFIBApp: embedded }),
      setAuthenticated: (authenticated: boolean) => set({ isAuthenticated: authenticated }),
      setPaymentResult: (transactionId, status) =>
        set({ lastPaymentId: transactionId, lastPaymentStatus: status }),
      setSsoAuthorizationCode: (code) => set({ ssoAuthorizationCode: code }),
      setUserDetails: (details) => set({ userDetails: details }),
      reset: () =>
        set({
          isEmbeddedInFIBApp: false,
          isAuthenticated: false,
          lastPaymentId: undefined,
          lastPaymentStatus: undefined,
          ssoAuthorizationCode: undefined,
          userDetails: undefined
        })
    }),
    {
      name: 'fib-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
