'use client'
import React, { useMemo } from 'react'
import {
  IconStar,
  IconStarFilled,
  IconTriangleFilled,
  IconTriangleInvertedFilled
} from '@tabler/icons-react'
import { useFavorites } from '@/context/FavoritesContext'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import ReactiveText from '@/components/common/ReactiveText'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { Token } from '@/hooks/usePerpetualData'
import { getUniverseIndex } from '@/utils/utils'
import useIsSpot from '@/hooks/useIsSpot'

interface AssetItemProps {
  assetKey: string

  selectedAsset: string | null
  setSelectedAsset: (assetKey: string) => void
}

const AssetItem: React.FC<AssetItemProps> = ({ assetKey, setSelectedAsset }) => {
  const { perpAssetContext, spotAssetContext } = useHyperliquid()
  const { data: universe } = usePerpsUniverse()
  const { data: spotMeta } = useSpotMeta()
  const { data: spotUniverse } = useSpotMeta()
  const { isFavorite, toggleFavorite } = useFavorites()
  const isSpot = useIsSpot()
  const type = isSpot ? 'spot' : 'perp'
  // Find the asset context for this asset
  const assetIndex = useMemo(() => {
    if (isSpot) {
      return spotUniverse.tokens.findIndex((asset) => asset.name === assetKey)
    }

    return universe.findIndex((asset) => asset.name === assetKey)
  }, [universe, assetKey, isSpot])

  const assetCtx = useMemo(() => {
    if (isSpot && assetIndex !== -1) {
      return spotAssetContext[assetIndex]
    }
    return assetIndex !== -1 ? perpAssetContext[assetIndex] : null
  }, [assetIndex, perpAssetContext, spotAssetContext])

  const selectedAssetContext = useMemo(() => {
    const coin = assetKey

    if (isSpot && spotMeta && spotAssetContext) {
      const spotAsset = spotMeta.tokens.find((a: Token) => a.name === coin)
      if (!spotAsset) return null

      const spotUniverse = spotMeta.universe.find(
        (a: { tokens: number[]; index: number }) => a.tokens[0] === spotAsset.index
      )
      if (!spotUniverse) return null

      const spotToken = spotAssetContext[spotUniverse.index]
      if (!spotToken) return null

      const coinDetails = spotAssetContext.find((a) => a.coin.includes(spotToken.coin))
      return coinDetails || null
    }
    const idx = getUniverseIndex(universe, assetKey)
    return perpAssetContext[idx] || null
  }, [assetKey, universe, perpAssetContext, spotAssetContext, isSpot, spotMeta])

  // Calculate price change if context exists
  const priceChangeData = useMemo(() => {
    // If change24h is provided as a prop, use that
    if (selectedAssetContext?.markPx !== undefined) {
      const changeValue =
        ((selectedAssetContext?.markPx - selectedAssetContext?.prevDayPx) /
          selectedAssetContext?.markPx) *
        100

      return {
        value: changeValue,
        className: changeValue >= 0 ? 'text-green' : 'text-red',
        raw: changeValue,
        isPositive: changeValue >= 0
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
  }, [assetCtx])

  const handleClick = () => {
    setSelectedAsset(assetKey)
  }

  // Format price display
  const formattedPrice = useMemo(() => {
    const price = isSpot ? selectedAssetContext?.markPx : selectedAssetContext?.midPx
    if (price === undefined || price === null) return '-'

    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(numPrice)) return '-'

    return numPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })
  }, [selectedAssetContext])

  return (
    <tr
      onClick={handleClick}
      key={assetKey}
      className="hover:bg-white/5 transition-colors duration-150 cursor-pointer"
    >
      {/* Market + Star */}
      <td className="py-2 font-medium whitespace-nowrap">
        <div className="flex items-center gap-2 pl-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(
                {
                  name: assetKey,
                  value: formattedPrice.toString(),
                  index: assetKey,
                  price: formattedPrice,
                  change24h: priceChangeData.value
                },
                type
              )
            }}
            className="focus:outline-none w-5 h-5 text-primary hover:scale-105 cursor-pointer"
            aria-label={isFavorite(assetKey, type) ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite(assetKey, type) ? (
              <IconStarFilled size={16} />
            ) : (
              <IconStar size={16} className="opacity-50 text-white" />
            )}
          </button>

          {isSpot ? (
            <p className="">{assetKey.split('-')[0]}/USDC</p>
          ) : (
            <p className="">{assetKey.split('-')[0]}-USDC</p>
          )}
          {!isSpot && (
            <p className="bg-primary/40 px-2 rounded-md text-xs">
              {universe[assetIndex]?.maxLeverage || 50}×
            </p>
          )}
        </div>
      </td>

      {/* Price */}
      <td className="px-6 py-2 text-right">${formattedPrice}</td>

      {/* 24h Change */}
      <td className={`px-6 py-2 text-right ${priceChangeData.className}`}>
        <div className="flex justify-end items-center">
          {priceChangeData.isPositive ? (
            <IconTriangleFilled size={8} className="mr-1" />
          ) : (
            <IconTriangleInvertedFilled size={8} className="mr-1" />
          )}
          {selectedAssetContext?.markPx !== undefined &&
            selectedAssetContext?.prevDayPx !== undefined && (
              <>
                <ReactiveText
                  precision={formattedPrice === '-' ? 2 : formattedPrice.split('.')[1]?.length || 2}
                  value={selectedAssetContext.markPx - selectedAssetContext.prevDayPx}
                  type="currency"
                  isStatic={true}
                />
                (
                {
                  <ReactiveText
                    precision={2}
                    value={
                      ((selectedAssetContext.markPx - selectedAssetContext.prevDayPx) /
                        selectedAssetContext.markPx) *
                      100
                    }
                    type="percentage"
                    isStatic={true}
                  />
                }
                )
              </>
            )}
        </div>
      </td>

      {/* Volume */}
      <td className="px-6 py-2 text-right">
        <ReactiveText value={Number(selectedAssetContext?.dayNtlVlm || 0)} type="currency" />{' '}
      </td>

      {/* Market Cap */}
      <td className="px-6 py-2 text-right">
        {isSpot
          ? selectedAssetContext?.markPx &&
            'circulatingSupply' in selectedAssetContext && (
              <ReactiveText
                value={Number(
                  selectedAssetContext.markPx * (selectedAssetContext.circulatingSupply || 1)
                )}
                type="currency"
              />
            )
          : selectedAssetContext?.midPx &&
            'openInterest' in selectedAssetContext && (
              <ReactiveText
                value={Number(
                  selectedAssetContext.midPx * (selectedAssetContext.openInterest || 1)
                )}
                type="currency"
              />
            )}
      </td>
    </tr>
  )
}

export default AssetItem
