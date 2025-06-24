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
import { getUniverseIndex } from '@/utils/utils'
import useIsSpot from '@/hooks/useIsSpot'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface AssetItemProps {
  assetKey: string
  selectedAsset: string | null
  setSelectedAsset: (assetKey: string) => void
  setIsOpen: (open: boolean) => void
}

const AssetItem: React.FC<AssetItemProps> = ({
  assetKey,
  setSelectedAsset,
  selectedAsset,
  setIsOpen
}) => {
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

    if (type === 'spot' && spotMeta && spotAssetContext) {
      const spotAsset = spotMeta.tokens.find((a) => a.name === coin)
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
    setIsOpen(false)
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
    <TableRow
      onClick={handleClick}
      key={assetKey}
      className={cn(
        'hover:bg-white/5 transition-colors duration-150 cursor-pointer',
        selectedAsset === assetKey && 'bg-accent'
      )}
    >
      <TableCell className="flex items-center w-3/12 justify-start gap-2">
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
          <p className="text-xs">{assetKey.split('-')[0]}/USDC</p>
        ) : (
          <p className="text-xs">{assetKey.split('-')[0]}-USDC</p>
        )}
        {!isSpot && (
          <p className="bg-primary/40 px-2 rounded-md text-xs">
            {universe[assetIndex]?.maxLeverage || 50}×
          </p>
        )}
      </TableCell>
      <TableCell className="text-right w-2/12 justify-end">{formattedPrice}</TableCell>
      <TableCell className="text-right w-3/12 justify-end">
        <div className="flex justify-end items-center">
          {priceChangeData.isPositive ? (
            <IconTriangleFilled className="size-2 mr-2 text-green" />
          ) : (
            <IconTriangleInvertedFilled className="size-2 mr-2 text-red" />
          )}
          {selectedAssetContext?.markPx !== undefined &&
            selectedAssetContext?.prevDayPx !== undefined && (
              <>
                <ReactiveText
                  precision={formattedPrice === '-' ? 2 : formattedPrice.split('.')[1]?.length || 2}
                  value={selectedAssetContext.markPx - selectedAssetContext.prevDayPx}
                  type="currency"
                  className="text-xs"
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
                    className="text-xs"
                    isStatic={true}
                  />
                }
                )
              </>
            )}
        </div>
      </TableCell>
      <TableCell className="text-right w-2/12 justify-end">
        <ReactiveText
          className="text-white/50 text-xs"
          value={Number(selectedAssetContext?.dayNtlVlm || 0)}
          type="currency"
        />{' '}
      </TableCell>
      <TableCell className="text-right w-2/12 justify-end">
        {isSpot
          ? selectedAssetContext?.markPx &&
            'circulatingSupply' in selectedAssetContext && (
              <ReactiveText
                className="text-white/50 text-xs"
                value={Number(
                  selectedAssetContext.markPx * (selectedAssetContext.circulatingSupply || 1)
                )}
                type="currency"
              />
            )
          : selectedAssetContext?.midPx &&
            'openInterest' in selectedAssetContext && (
              <ReactiveText
                className="text-white/50 text-xs"
                value={Number(
                  selectedAssetContext.midPx * (selectedAssetContext.openInterest || 1)
                )}
                type="currency"
              />
            )}
      </TableCell>
    </TableRow>
  )
}

export default AssetItem
