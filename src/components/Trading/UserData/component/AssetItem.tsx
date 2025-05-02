'use client'
import React, { useMemo } from 'react'
import Image, { StaticImageData } from 'next/image'
import { useHyperLiquid } from '@/context/HyperLiquid'
import {
  IconStar,
  IconStarFilled,
  IconTriangleFilled,
  IconTriangleInvertedFilled
} from '@tabler/icons-react'
import { useFavorites } from '@/context/FavoritesContext'

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
  icons = {},
  isInSelectorDropdown = false,
  price: propPrice,
  change24h: propChange24h,
  type
}) => {
  const { universe, perpAssetContext } = useHyperLiquid()
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
            className: isPositive ? 'text-[#2FA766]' : 'text-[#E2464A]',
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
        className: isPositive ? 'text-[#2FA766]' : 'text-[#E2464A]',
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
      className: isPositive ? 'text-[#2FA766]' : 'text-[#E2464A]',
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

    return numPrice.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }, [price])

  // Render UI based on whether it's in the selector dropdown or not
  if (isInSelectorDropdown) {
    return (
      <div
        key={assetKey}
        className="bg-white/5 cursor-pointer rounded-lg border-white/5 last:border-b-0"
      >
        <div onClick={handleClick} className="flex items-center px-4 py-3 text-white gap-2">
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
            className="text-yellow-500 hover:text-yellow-600 focus:outline-none cursor-pointer    h-5 w-5"
            aria-label={isFavorite(assetKey, type) ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite(assetKey, type) ? (
              <IconStarFilled size={16} className="mr-1" />
            ) : (
              <IconStar size={16} className="mr-1" />
            )}
          </button>
          <div className="w-3/12 flex items-center">
            {icons[assetKey] ? (
              <Image
                src={icons[assetKey]}
                alt={assetKey}
                style={{ width: 32, height: 32 }}
                className="h-8 w-8 rounded-full mr-2"
              />
            ) : (
              <div
                className={`rounded-full bg-[#6366F1] w-8 h-8 mr-2 flex items-center justify-center text-white font-bold`}
              >
                {assetKey.substring(0, 1)}
              </div>
            )}
            <span className="font-medium">{assetKey}</span>
          </div>
          <div className="w-1/12 text-right font-medium text-gray-300">
            {universe[assetIndex]?.maxLeverage || 50}×
          </div>
          <div className="w-2/12 text-right font-medium font-dm-mono">${formattedPrice}</div>
          <div
            className={`w-2/12 text-right font-medium ${priceChangeData.className} flex items-center justify-end font-dm-mono`}
          >
            {priceChangeData.isPositive ? (
              <IconTriangleFilled size={14} className="mr-1" />
            ) : (
              <IconTriangleInvertedFilled size={14} className="mr-1" />
            )}
            {priceChangeData.value}
          </div>
          <div className="w-2/12 text-right font-medium text-gray-300 font-mono">{volumeValue}</div>
          <div className="w-2/12 text-right font-medium text-gray-300 font-mono pr-4">
            {marketCap}
          </div>
        </div>
      </div>
    )
  }
}

export default AssetItem
