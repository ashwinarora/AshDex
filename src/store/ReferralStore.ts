import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

interface ReferralState {
  inviteCode: string | null
  referralPromptDismissed: boolean
  setInviteCode: (code: string | null) => void
  clearInviteCode: () => void
  dismissReferralPrompt: () => void
}

const useReferralStore = create<ReferralState>()(
  persist(
    (set) => ({
      inviteCode: null,
      referralPromptDismissed: false,

      setInviteCode: (code) => set({ inviteCode: code }),

      clearInviteCode: () => set({ inviteCode: null }),

      dismissReferralPrompt: () => set({ referralPromptDismissed: true })
    }),
    {
      name: 'referral',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

// Hook for accessing invite code state and actions
export const useInviteCode = () => {
  return useReferralStore(
    useShallow((state) => ({
      inviteCode: state.inviteCode,
      referralPromptDismissed: state.referralPromptDismissed,
      setInviteCode: state.setInviteCode,
      clearInviteCode: state.clearInviteCode,
      dismissReferralPrompt: state.dismissReferralPrompt
    }))
  )
}

// Hook for just reading the invite code (minimal re-renders)
export const useInviteCodeValue = () => {
  return useReferralStore((state) => state.inviteCode)
}

// Hook for just the setter (stable reference)
export const useSetInviteCode = () => {
  return useReferralStore((state) => state.setInviteCode)
}

// Hook for checking if referral prompt is dismissed
export const useReferralPromptDismissed = () => {
  return useReferralStore((state) => state.referralPromptDismissed)
}

// Hook for dismissing referral prompt
export const useDismissReferralPrompt = () => {
  return useReferralStore((state) => state.dismissReferralPrompt)
}

export default useReferralStore
