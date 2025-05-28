'use client'
import React, { useMemo } from 'react'
import { StaticImageData } from 'next/image'
import {
  IconStar,
  IconStarFilled,
  IconTriangleFilled,
  IconTriangleInvertedFilled
} from '@tabler/icons-react'
import { useFavorites } from '@/context/FavoritesContext'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'

interface AssetItemProps {
  assetKey: string
  value: string | number
  selectedAsset: string | null
  setSelectedAsset: (assetKey: string) => void
  icons?: Record<string, StaticImageData>
  isInSelectorDropdown?: boolean
  price?: string | number
  change24h?: string | number
  type: 'spot' | 'perp'
}

const AssetItem: React.FC<AssetItemProps> = ({
  assetKey,
  value,
  setSelectedAsset,

  isInSelectorDropdown = false,
  price: propPrice,
  change24h: propChange24h,
  type
}) => {
  const { perpAssetContext } = useHyperliquid()
  const { data: universe } = usePerpsUniverse()
  const { isFavorite, toggleFavorite } = useFavorites()

  // Find the asset context for this asset
  const assetIndex = useMemo(() => {
    return universe.findIndex((asset) => asset.name === assetKey)
  }, [universe, assetKey])

  const assetCtx = useMemo(() => {
    return assetIndex !== -1 ? perpAssetContext[assetIndex] : null
  }, [assetIndex, perpAssetContext])

  // Use price from props if available, otherwise calculate from context
  const price = useMemo(() => {
    // If price is provided as a prop, use that
    if (propPrice !== undefined) return propPrice

    // Otherwise, use value directly if it's a number
    if (typeof value === 'number') return value

    // If value is a string that could be a number, parse it
    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
      return parseFloat(value)
    }

    // Last resort: try to get from asset context
    return assetCtx?.midPx || 0
  }, [propPrice, value, assetCtx])

  // Calculate price change if context exists
  const priceChangeData = useMemo(() => {
    // If change24h is provided as a prop, use that
    if (propChange24h !== undefined) {
      let changeValue = propChange24h

      // Handle string formatting if needed
      if (typeof changeValue === 'string') {
        // If it's already formatted with %, just use it directly
        if (changeValue.includes('%')) {
          const isPositive = !changeValue.startsWith('-')
          return {
            value: changeValue,
            className: isPositive ? 'text-green' : 'text-red',
            raw: parseFloat(changeValue) || 0,
            isPositive
          }
        }

        // Otherwise try to parse it as a number
        changeValue = parseFloat(changeValue)
      }

      // Format the number
      const isPositive = Number(changeValue) >= 0
      return {
        value: `${isPositive ? '+' : ''}${Number(changeValue).toFixed(1)}%`,
        className: isPositive ? 'text-green' : 'text-red',
        raw: Number(changeValue),
        isPositive
      }
    }

    // If no prop is provided, calculate from context
    if (!assetCtx || !assetCtx.prevDayPx || !assetCtx.midPx) {
      return { value: '0.00%', className: 'text-gray-400', raw: 0, isPositive: false }
    }

    const prevDayPrice = assetCtx.prevDayPx
    const currentPrice = assetCtx.midPx
    const change = currentPrice - prevDayPrice
    const percentageChange = (change / prevDayPrice) * 100
    const isPositive = percentageChange >= 0

    return {
      value: `${isPositive ? '+' : ''}${percentageChange.toFixed(1)}%`,
      className: isPositive ? 'text-green' : 'text-red',
      raw: percentageChange,
      isPositive
    }
  }, [propChange24h, assetCtx])

  // Get volume and market data
  const volumeValue = useMemo(() => {
    return assetCtx?.dayNtlVlm ? `$${(assetCtx.dayNtlVlm / 1000000000).toFixed(1)}B` : '-'
  }, [assetCtx])

  // Market cap is estimated/placeholder
  const marketCap = useMemo(() => {
    return assetCtx?.midPx
      ? `$${((assetCtx.midPx * (assetCtx.openInterest || 1)) / 1000000000).toFixed(1)}B`
      : '-'
  }, [assetCtx])

  const handleClick = () => {
    setSelectedAsset(assetKey)
  }

  // Format price display
  const formattedPrice = useMemo(() => {
    if (price === undefined || price === null || price === '') return '-'

    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(numPrice)) return '-'

    return numPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }, [price])

  // Render UI based on whether it's in the selector dropdown or not
  if (isInSelectorDropdown) {
    return (
      <tr
        onClick={handleClick}
        key={assetKey}
        className="transition-colors duration-150 cursor-pointer hover:bg-white/5"
      >
        {/* Market + Star */}
        <td className="px-6 py-2 font-medium whitespace-nowrap">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(
                  {
                    name: assetKey,
                    value: price.toString(),
                    index: assetKey,
                    price: price,
                    change24h: priceChangeData.value
                  },
                  type
                )
              }}
              className="w-5 h-5 text-yellow-500 hover:text-yellow-600 focus:outline-none"
              aria-label={isFavorite(assetKey, type) ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite(assetKey, type) ? <IconStarFilled size={16} /> : <IconStar size={16} />}
            </button>
            {assetKey}
            <p className="px-2">{universe[assetIndex]?.maxLeverage || 50}×</p>
          </div>
        </td>

        {/* Price */}
        <td className="px-6 py-2 text-right">${formattedPrice}</td>

        {/* 24h Change */}
        <td className={`px-6 py-2 text-right ${priceChangeData.className}`}>
          <div className="flex items-center justify-end">
            {priceChangeData.isPositive ? (
              <IconTriangleFilled size={14} className="mr-1" />
            ) : (
              <IconTriangleInvertedFilled size={14} className="mr-1" />
            )}
            {priceChangeData.value}
          </div>
        </td>

        {/* Volume */}
        <td className="px-6 py-2 text-right">{volumeValue}</td>

        {/* Market Cap */}
        <td className="px-6 py-2 text-right">{marketCap}</td>
      </tr>
    )
  }
}

export default AssetItem
