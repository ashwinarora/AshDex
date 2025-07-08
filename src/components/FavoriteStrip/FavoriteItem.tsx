'use client'

import useIsSpot from '@/hooks/useIsSpot'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useMemo } from 'react'
import { ToggleGroupItem } from '../ui/toggle-group'
import { cn } from '@/lib/utils'
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'
import { useShallow } from 'zustand/react/shallow'

interface FavoriteItemProps {
  assetKey: string
}

const FavoriteItem = ({ assetKey }: FavoriteItemProps) => {
  const isSpot = useIsSpot()
  const { spotAssetContext, perpAssetContext, perpsMeta } = useHyperliquidStore(
    useShallow((state) => ({
      spotAssetContext: state.spotAssetContext,
      perpAssetContext: state.perpAssetContext,
      perpsMeta: state.perpsMeta
    }))
  )
  const { spotKeyToName } = useSpotMeta()

  const data = useMemo(() => {
    if (isSpot) {
      const asset = spotAssetContext.find((asset) => asset.coin === assetKey)
      const change =
        ((Number(asset?.markPx) - Number(asset?.prevDayPx)) / Number(asset?.prevDayPx)) * 100
      const name = spotKeyToName.get(assetKey)
      return {
        name,
        price: asset?.markPx,
        change24h: isNaN(change) ? '-' : change.toFixed(2).concat('%'),
        isPositive: change >= 0,
        isPrice: true
      }
    } else {
      const index = perpsMeta?.universe.findIndex((asset) => asset.name === assetKey)
      const asset = perpAssetContext[index!]
      const change =
        ((Number(asset?.markPx) - Number(asset?.prevDayPx)) / Number(asset?.prevDayPx)) * 100
      return {
        name: assetKey,
        price: asset?.markPx,
        change24h: isNaN(change) ? '-' : change.toFixed(2).concat('%'),
        isPositive: change >= 0,
        isPrice: false
      }
    }
  }, [assetKey, isSpot, perpAssetContext, perpsMeta, spotAssetContext, spotKeyToName])

  return (
    <ToggleGroupItem
      value={assetKey}
      key={assetKey}
      className="flex w-28 shrink-0 items-center justify-center gap-2 bg-transparent border-none h-full rounded-sm"
    >
      {data.isPositive ? (
        <IconTrendingUp className="size-3 text-green" />
      ) : (
        <IconTrendingDown className="size-3 text-red" />
      )}
      <p
        className={cn('text-xs font-bold text-white', data.isPositive ? 'text-green' : 'text-red')}
      >
        {data.name}
      </p>
      <p className={cn('text-xs text-white/50', data.isPositive ? 'text-green' : 'text-red')}>
        {data.change24h}
      </p>
    </ToggleGroupItem>
  )
}

export default FavoriteItem
