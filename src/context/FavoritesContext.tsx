'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { useHyperLiquid } from './HyperLiquid'

interface FavoriteAsset {
  name: string
  value: string
  index: string // This is the asset name, e.g., "BTC-PERP"
  price?: string | number
  change24h?: string | number
}

interface FavoritesContextType {
  favorites: FavoriteAsset[]
  addFavorite: (asset: FavoriteAsset) => void
  removeFavorite: (assetKey: string) => void
  isFavorite: (assetKey: string) => boolean
  toggleFavorite: (asset: FavoriteAsset) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

// Default favorites to add when no favorites exist
const DEFAULT_FAVORITES: FavoriteAsset[] = [
  { name: 'BTC-PERP', value: '0', index: 'BTC-PERP' },
  { name: 'ETH-PERP', value: '0', index: 'ETH-PERP' },
  { name: 'HYPE-PERP', value: '0', index: 'HYPE-PERP' },
  { name: 'PURR-PERP', value: '0', index: 'PURR-PERP' }
]

// Helper to format price change with amount and percentage
const formatPriceChange = (currentPrice: number, prevDayPrice: number): string => {
  if (!currentPrice || !prevDayPrice || prevDayPrice <= 0) return '0%'

  const changeAmount = currentPrice - prevDayPrice
  const changePercent = (changeAmount / prevDayPrice) * 100

  const formattedAmount = changeAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  const formattedPercent = changePercent.toFixed(2)
  const sign = changePercent >= 0 ? '+' : ''

  return `${sign}${formattedAmount} (${sign}${formattedPercent}%)`
}

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteAsset[]>([])
  const { allMids, perpAssetContext, universe } = useHyperLiquid()
  const isInitialized = useRef(false) // Ref to track initialization

  // --- Load favorites from localStorage on initial render ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedFavorites = localStorage.getItem('favorites')

      let initialFavorites: FavoriteAsset[] = []

      if (storedFavorites) {
        try {
          const parsedFavorites = JSON.parse(storedFavorites)
          if (Array.isArray(parsedFavorites)) {
            initialFavorites = parsedFavorites
          } else {
            localStorage.removeItem('favorites')
          }
        } catch (error) {
          console.error('[Favorites] Error parsing from localStorage:', error)
          localStorage.removeItem('favorites')
        }
      }

      // If no favorites exist or the array is empty, add default favorites
      if (initialFavorites.length === 0) {
        initialFavorites = DEFAULT_FAVORITES.map((fav) => {
          // Try to populate with current price data if available
          const price = allMids ? String(allMids[fav.index] ?? '0') : '0'

          // Calculate 24h price change if data is available
          let change24h = '0'
          if (universe && perpAssetContext) {
            const assetIndex = universe.findIndex((asset) => asset.name === fav.index)
            if (assetIndex !== -1 && perpAssetContext[assetIndex]) {
              const currentPrice = perpAssetContext[assetIndex].midPx
              const prevDayPrice = perpAssetContext[assetIndex].prevDayPx

              if (prevDayPrice && currentPrice && prevDayPrice > 0) {
                change24h = formatPriceChange(currentPrice, prevDayPrice)
              }
            }
          }

          return {
            ...fav,
            price,
            change24h
          }
        })
        // Save default favorites to localStorage
        localStorage.setItem('favorites', JSON.stringify(initialFavorites))
      }

      setFavorites(initialFavorites)
      isInitialized.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Update favorites when perpAssetContext or allMids changes ---
  useEffect(() => {
    // Skip if not initialized or if we don't have the required data
    if (
      !isInitialized.current ||
      favorites.length === 0 ||
      !perpAssetContext ||
      perpAssetContext.length === 0 ||
      !universe ||
      universe.length === 0 ||
      !allMids
    ) {
      return
    }

    const updatedFavorites = favorites.map((favorite) => {
      const assetIndex = universe.findIndex((asset) => asset.name === favorite.index)

      // If we can't find the asset in the universe, return it unchanged
      if (assetIndex === -1 || !perpAssetContext[assetIndex]) {
        return favorite
      }

      // Get current price data
      const currentPrice = perpAssetContext[assetIndex].midPx
      const prevDayPrice = perpAssetContext[assetIndex].prevDayPx

      // Update price if available
      const newPrice = allMids[favorite.index]
        ? `$${allMids[favorite.index].toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`
        : favorite.price

      // Update change24h if available
      let newChange24h = favorite.change24h
      if (currentPrice && prevDayPrice && prevDayPrice > 0) {
        newChange24h = formatPriceChange(currentPrice, prevDayPrice)
      }

      // Only create a new object if something changed
      if (
        String(newPrice) !== String(favorite.price) ||
        String(newChange24h) !== String(favorite.change24h)
      ) {
        return {
          ...favorite,
          price: newPrice,
          change24h: newChange24h
        }
      }

      return favorite
    })

    // Only update state and localStorage if something actually changed
    const updatedJson = JSON.stringify(updatedFavorites)
    const currentJson = JSON.stringify(favorites)

    if (updatedJson !== currentJson) {
      setFavorites(updatedFavorites)
      localStorage.setItem('favorites', updatedJson)
    }
  }, [perpAssetContext, allMids, universe, favorites])

  // --- Favorite Management Functions ---

  const addFavorite = (asset: FavoriteAsset) => {
    if (!isFavorite(asset.index)) {
      const existingData = favorites.find((f) => f.index === asset.index)
      const newFavorite: FavoriteAsset = {
        ...asset,
        price: asset.price ?? existingData?.price ?? String(allMids[asset.index] ?? '0'),
        change24h: asset.change24h ?? existingData?.change24h ?? '0'
      }
      setFavorites((prev) => [...prev, newFavorite])
      localStorage.setItem('favorites', JSON.stringify([...favorites, newFavorite]))
    }
  }

  const removeFavorite = (assetKey: string) => {
    const updatedFavorites = favorites.filter((fav) => fav.index !== assetKey)
    setFavorites(updatedFavorites)
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
  }

  const isFavorite = (assetKey: string) => {
    return favorites.some((fav) => fav.index === assetKey)
  }

  const toggleFavorite = (asset: FavoriteAsset) => {
    if (isFavorite(asset.index)) {
      removeFavorite(asset.index)
    } else {
      addFavorite(asset)
    }
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
