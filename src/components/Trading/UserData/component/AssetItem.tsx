'use client'
import React, { useMemo } from 'react'
import Image, { StaticImageData } from 'next/image'
import { useHyperLiquid } from '@/context/HyperLiquid'

// Default icon color by first letter (for coins without icons)
const ICON_COLORS: Record<string, string> = {
  A: 'from-blue-500 to-cyan-400',
  B: 'from-yellow-500 to-orange-400',
  C: 'from-green-500 to-emerald-400',
  D: 'from-yellow-400 to-yellow-600',
  E: 'from-purple-400 to-indigo-500',
  F: 'from-red-500 to-pink-500',
  L: 'from-green-400 to-teal-500',
  R: 'from-orange-500 to-red-500',
  S: 'from-blue-400 to-indigo-600',
  T: 'from-purple-500 to-indigo-600',
  U: 'from-indigo-400 to-blue-600',
  X: 'from-pink-500 to-rose-500'
}

// Get gradient for coin without icon
const getCoinGradient = (symbol: string): string => {
  const firstLetter = symbol.charAt(0).toUpperCase()
  return ICON_COLORS[firstLetter] || 'from-gray-400 to-gray-600'
}

interface AssetItemProps {
  assetKey: string
  value: string | number
  selectedAsset: string | null
  setSelectedAsset: (assetKey: string) => void
  icons?: Record<string, StaticImageData>
  isInSelectorDropdown?: boolean
  price?: string | number
  change24h?: string | number
}

const AssetItem: React.FC<AssetItemProps> = ({
  assetKey,
  value,
  selectedAsset,
  setSelectedAsset,
  icons = {},
  isInSelectorDropdown = false,
  price: propPrice,
  change24h: propChange24h
}) => {
  const { universe, perpAssetContext } = useHyperLiquid()

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
            className: isPositive ? 'text-[#4DAA85]' : 'text-[#F45F5F]',
            raw: parseFloat(changeValue) || 0
          }
        }

        // Otherwise try to parse it as a number
        changeValue = parseFloat(changeValue)
      }

      // Format the number
      const isPositive = Number(changeValue) >= 0
      return {
        value: `${isPositive ? '+' : ''}${Number(changeValue).toFixed(1)}%`,
        className: isPositive ? 'text-[#4DAA85]' : 'text-[#F45F5F]',
        raw: Number(changeValue)
      }
    }

    // If no prop is provided, calculate from context
    if (!assetCtx || !assetCtx.prevDayPx || !assetCtx.midPx) {
      return { value: '0.00%', className: 'text-gray-400', raw: 0 }
    }

    const prevDayPrice = assetCtx.prevDayPx
    const currentPrice = assetCtx.midPx
    const change = currentPrice - prevDayPrice
    const percentageChange = (change / prevDayPrice) * 100
    const isPositive = percentageChange >= 0

    return {
      value: `${isPositive ? '+' : ''}${percentageChange.toFixed(1)}%`,
      className: isPositive ? 'text-[#4DAA85]' : 'text-[#F45F5F]',
      raw: percentageChange
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
        onClick={handleClick}
        className="bg-white/5 cursor-pointer rounded-lg border-white/5 last:border-b-0"
      >
        <div className="flex items-center px-4 py-3 text-white">
          <div className="w-1/12">
            <div
              className={`h-5 w-5 rounded-full border ${
                selectedAsset === assetKey
                  ? 'border-[#6366F1] bg-[#6366F1]'
                  : 'border-[#FFFFFF30] bg-transparent'
              } flex items-center justify-center`}
            >
              {selectedAsset === assetKey && <div className="h-2 w-2 rounded-full bg-white"></div>}
            </div>
          </div>
          <div className="w-3/12 flex items-center">
            {icons[assetKey] ? (
              <Image
                src={icons[assetKey]}
                alt={assetKey}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full mr-2"
              />
            ) : (
              <div
                className={`rounded-full bg-gradient-to-r ${getCoinGradient(
                  assetKey
                )} h-8 w-8 flex items-center justify-center mr-2 text-white font-bold`}
              >
                {assetKey.substring(0, 1)}
              </div>
            )}
            <span className="font-medium">{assetKey}</span>
          </div>
          <div className="w-1/12 text-right font-medium text-gray-300">
            {universe[assetIndex]?.maxLeverage || 50}×
          </div>
          <div className="w-2/12 text-right font-medium">${formattedPrice}</div>
          <div className={`w-2/12 text-right font-medium ${priceChangeData.className}`}>
            {priceChangeData.value}
          </div>
          <div className="w-2/12 text-right font-medium text-gray-300">{volumeValue}</div>
          <div className="w-2/12 text-right font-medium text-gray-300 pr-4">{marketCap}</div>
        </div>
      </div>
    )
  }

  // Default view for non-dropdown usage
  return (
    <div
      key={assetKey}
      onClick={handleClick}
      className="flex items-center px-4 py-3 text-white cursor-pointer hover:bg-[#FFFFFF0F] rounded-md transition-colors m-2"
    >
      {/* Radio selection */}
      <div className="min-w-6 flex items-center">
        <div
          className={`min-w-6 min-h-6 border-2 rounded-full flex items-center justify-center ${
            selectedAsset === assetKey
              ? 'border-[#5F46F9] bg-transparent'
              : 'bg-[#0F081680] border-[#FFFFFF29]'
          }`}
        >
          {selectedAsset === assetKey && (
            <div className="min-w-2 min-h-2 bg-[#5F46F9] rounded-full"></div>
          )}
        </div>
      </div>

      {/* Asset information */}
      <div className="flex flex-1 items-center">
        {/* Asset name and icon */}
        <div className="flex min-w-[140px] items-center space-x-2 ml-3">
          {icons[assetKey] ? (
            <Image src={icons[assetKey]} alt={assetKey} className="w-6 h-6" />
          ) : (
            <div
              className={`rounded-full bg-gradient-to-r ${getCoinGradient(assetKey)} w-6 h-6 flex items-center justify-center text-white font-bold`}
            >
              {assetKey.substring(0, 1)}
            </div>
          )}
          <span className="font-medium">{assetKey}</span>
        </div>

        {/* Leverage */}
        <div className="min-w-[60px] text-center">
          <p className="mx-1">{universe[assetIndex]?.maxLeverage || 50}×</p>
        </div>

        {/* Price */}
        <div className="min-w-[100px] text-right">${formattedPrice}</div>

        {/* 24h Change */}
        <div className={`min-w-[100px] text-right ${priceChangeData.className}`}>
          {priceChangeData.value}
        </div>

        {/* Volume and Market Cap */}
        <div className="min-w-[100px] text-right text-gray-300">{volumeValue}</div>
        <div className="min-w-[100px] text-right text-gray-300">{marketCap}</div>
      </div>
    </div>
  )
}

export default AssetItem
