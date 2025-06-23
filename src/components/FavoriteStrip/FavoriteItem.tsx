'use client'

import useIsSpot from '@/hooks/useIsSpot'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { useMemo } from 'react'

interface FavoriteItemProps {
  assetKey: string
  setSelectedAsset: (asset: string) => void
}

const FavoriteItem = ({ assetKey, setSelectedAsset }: FavoriteItemProps) => {
  const isSpot = useIsSpot()
  const { spotAssetContext, perpAssetContext, perpsMeta } = useHyperliquid()
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
    <button
      onClick={() => setSelectedAsset(assetKey)}
      className="flex justify-center items-center gap-1 hover:bg-white/5 px-3 py-1 h-full cursor-pointer"
    >
      <span className="my-auto font-medium text-[#E8E0F1] text-sm">{data.name}</span>

      <div
        className={`text-[12px] ${data.isPositive ? 'text-green' : 'text-red'} my-auto flex items-center`}
      >
        {data.change24h}
      </div>
      <span className="my-auto text-[12px] text-gray-400">{data.price}</span>
    </button>
  )
}

export default FavoriteItem
