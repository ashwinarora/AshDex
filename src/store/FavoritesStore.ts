import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { persist, createJSONStorage } from 'zustand/middleware'

interface FavoritesState {
  perps: Set<string>
  spot: Set<string>
  togglePerp: (item: string) => void
  toggleSpot: (item: string) => void
  isSpotFavorite: (item: string) => boolean
  isPerpFavorite: (item: string) => boolean
}

const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      perps: new Set<string>(),
      spot: new Set<string>(),
      togglePerp: (item: string) => {
        set((state) => {
          const newPerps = new Set(state.perps)
          if (newPerps.has(item)) {
            newPerps.delete(item)
          } else {
            newPerps.add(item)
          }
          return { perps: newPerps }
        })
      },
      toggleSpot: (item: string) => {
        set((state) => {
          const newSpot = new Set(state.spot)
          if (newSpot.has(item)) {
            newSpot.delete(item)
          } else {
            newSpot.add(item)
          }
          return { spot: newSpot }
        })
      },
      isSpotFavorite: (item: string) => {
        return get().spot.has(item)
      },
      isPerpFavorite: (item: string) => {
        return get().perps.has(item)
      }
    }),
    {
      name: 'favorites',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export const useFavorites = (isSpot: boolean) => {
  return useFavoritesStore(
    useShallow((state) => {
      return isSpot
        ? {
          favorites: state.spot,
          toggleFavorite: state.toggleSpot,
          isFavorite: state.isSpotFavorite,
        }
        : {
          favorites: state.perps,
          toggleFavorite: state.togglePerp,
          isFavorite: state.isPerpFavorite
        }
    })
  )
}
