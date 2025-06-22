import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

interface FavoritesState {
  perps: Set<string>
  spot: Set<string>
  togglePerp: (item: string) => void
  toggleSpot: (item: string) => void
}

/**
 * Converts every Set -> { dataType:'Set', value:[...] } on save
 * and performs the inverse on load.
 */
const storage = createJSONStorage<FavoritesState>(() => localStorage, {
  replacer: (_, value) => (value instanceof Set ? { dataType: 'Set', value: [...value] } : value),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reviver: (_, value: any) => (value.dataType === 'Set' ? new Set<string>(value.value) : value)
})

const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      perps: new Set<string>(),
      spot: new Set<string>(),

      togglePerp: (item) =>
        set((state) => {
          const perps = new Set(state.perps)
          if (perps.has(item)) {
            perps.delete(item)
          } else {
            perps.add(item)
          }
          return { perps }
        }),

      toggleSpot: (item) =>
        set((state) => {
          const spot = new Set(state.spot)
          if (spot.has(item)) {
            spot.delete(item)
          } else {
            spot.add(item)
          }
          return { spot }
        })
    }),
    {
      name: 'favorites',
      storage,
      // optional: convert any old array-based data when users upgrade
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      merge: (persisted: any, _current) => ({
        ..._current,
        ...persisted,
        perps: new Set(persisted.perps ?? []),
        spot: new Set(persisted.spot ?? [])
      })
    }
  )
)

export const useFavorites = (isSpot: boolean) => {
  return useFavoritesStore(
    useShallow((state) => {
      return isSpot
        ? {
            favorites: state.spot,
            toggleFavorite: state.toggleSpot
          }
        : {
            favorites: state.perps,
            toggleFavorite: state.togglePerp
          }
    })
  )
}
