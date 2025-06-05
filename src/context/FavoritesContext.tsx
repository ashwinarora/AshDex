'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import useIsSpot from '@/hooks/useIsSpot'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
interface FavoriteAsset {
  name: string
  value: string
  index: string
  price?: string | number
  change24h?: string | number
  type: 'spot' | 'perp'
}

interface FavoritesData {
  spot: FavoriteAsset[]
  perp: FavoriteAsset[]
}

interface FavoritesContextType {
  favorites: FavoritesData
  addFavorite: (asset: Omit<FavoriteAsset, 'type'>, type: 'spot' | 'perp') => void
  removeFavorite: (assetKey: string, type: 'spot' | 'perp') => void
  isFavorite: (assetKey: string, type: 'spot' | 'perp') => boolean
  toggleFavorite: (asset: Omit<FavoriteAsset, 'type'>, type: 'spot' | 'perp') => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

// Define default assets for each market type
const DEFAULT_ASSETS = {
  perp: ['BTC-PERP', 'ETH-PERP', 'HYPE-PERP', 'PURR-PERP'],
  spot: ['UBTC-SPOT', 'UETH-SPOT', 'HYPE-SPOT', 'PURR-SPOT']
}

// Create default favorites dynamically
const createDefaultFavorites = (): FavoritesData => {
  return {
    perp: DEFAULT_ASSETS.perp.map((asset) => ({
      name: asset,
      value: '0',
      index: asset,
      type: 'perp'
    })),
    spot: DEFAULT_ASSETS.spot.map((asset) => ({
      name: asset,
      value: '0',
      index: asset,
      type: 'spot'
    }))
  }
}

// Use the function to get default favorites
const DEFAULT_FAVORITES: FavoritesData = createDefaultFavorites()

// Helper to format price change with amount and percentage
const formatPriceChange = (currentPrice: number, prevDayPrice: number): string => {
  if (!currentPrice || !prevDayPrice || prevDayPrice <= 0) return '0%'

  const changeAmount = currentPrice - prevDayPrice
  const changePercent = (changeAmount / prevDayPrice) * 100

  const formattedAmount = changeAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  const formattedPercent = changePercent.toFixed(2)
  const sign = changePercent >= 0 ? '+' : ''

  return `${sign}${formattedAmount} (${sign}${formattedPercent}%)`
}

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoritesData>({ spot: [], perp: [] })
  const { allMids, perpAssetContext, spotAssetContext } = useHyperliquid()
  const { data: universe } = usePerpsUniverse()
  const isInitialized = useRef(false)
  const isSpot = useIsSpot()
  // Load favorites from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedFavorites = localStorage.getItem('favorites')

      let initialFavorites: FavoritesData = {
        spot: [],
        perp: []
      }

      if (storedFavorites) {
        try {
          const parsedFavorites = JSON.parse(storedFavorites)
          if (parsedFavorites.spot && parsedFavorites.perp) {
            // If either spot or perp is empty, use the defaults for that type
            initialFavorites = {
              spot: parsedFavorites.spot.length ? parsedFavorites.spot : DEFAULT_FAVORITES.spot,
              perp: parsedFavorites.perp.length ? parsedFavorites.perp : DEFAULT_FAVORITES.perp
            }
          } else {
            // If the stored data is invalid, use the defaults
            initialFavorites = DEFAULT_FAVORITES
          }
        } catch (error) {
          console.error('[Favorites] Error parsing from localStorage:', error)
          initialFavorites = DEFAULT_FAVORITES
        }
      } else {
        // If no stored favorites, use the defaults
        initialFavorites = DEFAULT_FAVORITES
      }

      // Always save the initial favorites back to localStorage
      localStorage.setItem('favorites', JSON.stringify(initialFavorites))
      setFavorites(initialFavorites)
      isInitialized.current = true
    }
  }, [])

  // Update favorites when perpAssetContext or allMids changes
  useEffect(() => {
    if (
      !isInitialized.current ||
      (!favorites.perp.length && !favorites.spot.length) ||
      !perpAssetContext ||
      !universe ||
      !allMids ||
      !spotAssetContext
    ) {
      return
    }

    const updateFavoritesList = (favoritesList: FavoriteAsset[]) => {
      return favoritesList.map((favorite) => {
        const assetIndex = isSpot
          ? spotAssetContext.findIndex((asset) => asset.coin === favorite.index)
          : universe.findIndex((asset) => asset.name === favorite.index)

        if (assetIndex === -1 || !perpAssetContext[assetIndex] || !spotAssetContext[assetIndex]) {
          return favorite
        }

        const currentPrice = isSpot
          ? spotAssetContext[assetIndex].midPx
          : perpAssetContext[assetIndex].midPx
        const prevDayPrice = isSpot
          ? spotAssetContext[assetIndex].prevDayPx
          : perpAssetContext[assetIndex].prevDayPx
        const newPrice = allMids[favorite.index]
          ? `$${allMids[favorite.index].toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`
          : favorite.price

        let newChange24h = favorite.change24h
        if (currentPrice && prevDayPrice && prevDayPrice > 0) {
          newChange24h = formatPriceChange(currentPrice, prevDayPrice)
        }

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
    }

    const updatedFavorites = {
      spot: updateFavoritesList(favorites.spot),
      perp: updateFavoritesList(favorites.perp)
    }

    const updatedJson = JSON.stringify(updatedFavorites)
    const currentJson = JSON.stringify(favorites)

    if (updatedJson !== currentJson) {
      setFavorites(updatedFavorites)
      localStorage.setItem('favorites', updatedJson)
    }
  }, [perpAssetContext, allMids, universe, favorites, spotAssetContext])

  const addFavorite = (asset: Omit<FavoriteAsset, 'type'>, type: 'spot' | 'perp') => {
    if (!isFavorite(asset.index, type)) {
      const existingData = favorites[type].find((f) => f.index === asset.index)
      const newFavorite: FavoriteAsset = {
        ...asset,
        type,
        price: asset.price ?? existingData?.price ?? String(allMids[asset.index] ?? '0'),
        change24h: asset.change24h ?? existingData?.change24h ?? '0'
      }

      const updatedFavorites = {
        ...favorites,
        [type]: [...favorites[type], newFavorite]
      }

      setFavorites(updatedFavorites)
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
    }
  }

  const removeFavorite = (assetKey: string, type: 'spot' | 'perp') => {
    const updatedFavorites = {
      ...favorites,
      [type]: favorites[type].filter((fav) => fav.index !== assetKey)
    }
    setFavorites(updatedFavorites)
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
  }

  const isFavorite = (assetKey: string, type: 'spot' | 'perp') => {
    return favorites[type].some((fav) => fav.index === assetKey)
  }

  const toggleFavorite = (asset: Omit<FavoriteAsset, 'type'>, type: 'spot' | 'perp') => {
    if (isFavorite(asset.index, type)) {
      removeFavorite(asset.index, type)
    } else {
      addFavorite(asset, type)
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
