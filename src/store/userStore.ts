import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

// Types for notification settings
export type NotificationSettingKey =
  | 'order_updates'
  | 'liquidation_alerts'
  | 'new_feature_updates'
  | 'new_token_listings'
  | 'vaults_distribution_updates'
  | 'rewards_referrals_updates'
  | 'security_alerts'

// Acceptable languages
export const ACCEPTABLE_LANGUAGES = ['English', 'Arabic'] as const
export type AcceptableLanguage = (typeof ACCEPTABLE_LANGUAGES)[number]

export interface UserPreferences {
  popup_position: number
  sound_enabled: boolean
  order_updates: boolean
  liquidation_alerts: boolean
  new_feature_updates: boolean
  new_token_listings: boolean
  vaults_distribution_updates: boolean
  rewards_referrals_updates: boolean
  security_alerts: boolean
}

export interface UserStoreState {
  // User preferences
  preferredLanguage: AcceptableLanguage
  userPreferences: UserPreferences

  // Actions
  setPreferredLanguage: (language: AcceptableLanguage) => void
  setUserPreferences: (preferences: Partial<UserPreferences>) => void
  updateNotificationSetting: (key: NotificationSettingKey, value: boolean) => void
  setPopupPosition: (position: number) => void
  setSoundEnabled: (enabled: boolean) => void
  resetToDefaults: () => void
}

// Default values
const defaultUserPreferences: UserPreferences = {
  popup_position: 2, // Bottom Right
  sound_enabled: false,
  order_updates: false,
  liquidation_alerts: false,
  new_feature_updates: false,
  new_token_listings: false,
  vaults_distribution_updates: false,
  rewards_referrals_updates: false,
  security_alerts: false
}

const useUserStore = create<UserStoreState>()(
  persist(
    (set) => ({
      // Initial state
      preferredLanguage: 'English' as AcceptableLanguage,
      userPreferences: defaultUserPreferences,

      // Actions
      setPreferredLanguage: (language: AcceptableLanguage) => {
        set({ preferredLanguage: language })
      },

      setUserPreferences: (preferences: Partial<UserPreferences>) => {
        set((state) => ({
          userPreferences: {
            ...state.userPreferences,
            ...preferences
          }
        }))
      },

      updateNotificationSetting: (key: NotificationSettingKey, value: boolean) => {
        set((state) => ({
          userPreferences: {
            ...state.userPreferences,
            [key]: value
          }
        }))
      },

      setPopupPosition: (position: number) => {
        set((state) => ({
          userPreferences: {
            ...state.userPreferences,
            popup_position: position
          }
        }))
      },

      setSoundEnabled: (enabled: boolean) => {
        set((state) => ({
          userPreferences: {
            ...state.userPreferences,
            sound_enabled: enabled
          }
        }))
      },

      resetToDefaults: () => {
        set({
          preferredLanguage: 'English' as AcceptableLanguage,
          userPreferences: defaultUserPreferences
        })
      }
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => localStorage),
      // Optional: migrate old data if needed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      merge: (persisted: any, current) => ({
        ...current,
        ...persisted,
        userPreferences: {
          ...defaultUserPreferences,
          ...persisted.userPreferences
        }
      })
    }
  )
)

// Hook for accessing user preferences with shallow comparison
export const useUserPreferences = () => {
  return useUserStore(
    useShallow((state) => ({
      userPreferences: state.userPreferences,
      setUserPreferences: state.setUserPreferences,
      updateNotificationSetting: state.updateNotificationSetting,
      setPopupPosition: state.setPopupPosition,
      setSoundEnabled: state.setSoundEnabled
    }))
  )
}

// Hook for accessing language settings
export const useLanguageSettings = () => {
  return useUserStore(
    useShallow((state) => ({
      preferredLanguage: state.preferredLanguage,
      setPreferredLanguage: state.setPreferredLanguage
    }))
  )
}

// Hook for accessing all user store functionality
export const useUserStoreAll = () => {
  return useUserStore()
}

export default useUserStore