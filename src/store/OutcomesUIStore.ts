import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { OutcomeCategory } from '@/utils/outcomes/types'

/**
 * Persisted UI state for the Outcomes section: which third-party venues the
 * user has acknowledged the HIP-4 deployer disclaimer for, favorite cards,
 * and the last landing-page filters. Same Set-aware storage as FavoritesStore.
 */
interface OutcomesUIState {
  acknowledgedVenues: Set<string>
  favorites: Set<string> // card keys: `q:<questionId>` | `o:<outcomeId>`
  category: OutcomeCategory | 'All'
  venue: string | 'All' | 'hl'
  acknowledgeVenue: (venue: string) => void
  toggleFavorite: (key: string) => void
  setCategory: (c: OutcomeCategory | 'All') => void
  setVenue: (v: string | 'All' | 'hl') => void
}

const storage = createJSONStorage<OutcomesUIState>(() => localStorage, {
  replacer: (_, value) => (value instanceof Set ? { dataType: 'Set', value: [...value] } : value),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reviver: (_, value: any) => (value?.dataType === 'Set' ? new Set<string>(value.value) : value)
})

export const useOutcomesUIStore = create<OutcomesUIState>()(
  persist(
    (set) => ({
      acknowledgedVenues: new Set<string>(),
      favorites: new Set<string>(),
      category: 'All',
      venue: 'All',
      acknowledgeVenue: (venue) =>
        set((state) => {
          const acknowledgedVenues = new Set(state.acknowledgedVenues)
          acknowledgedVenues.add(venue)
          return { acknowledgedVenues }
        }),
      toggleFavorite: (key) =>
        set((state) => {
          const favorites = new Set(state.favorites)
          if (favorites.has(key)) favorites.delete(key)
          else favorites.add(key)
          return { favorites }
        }),
      setCategory: (category) => set({ category }),
      setVenue: (venue) => set({ venue })
    }),
    {
      name: 'outcomes-ui',
      storage,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      merge: (persisted: any, current) => ({
        ...current,
        ...persisted,
        acknowledgedVenues: new Set(persisted?.acknowledgedVenues ?? []),
        favorites: new Set(persisted?.favorites ?? [])
      })
    }
  )
)

export const useOutcomeFavorites = () =>
  useOutcomesUIStore(
    useShallow((s) => ({ favorites: s.favorites, toggleFavorite: s.toggleFavorite }))
  )
