import { useHyperliquid } from '@/store/HyperliquidStore'
import { IconSelector } from '@tabler/icons-react'
import AssetItem from './AssetItem'
import { useState } from 'react'
import { PerpsAssetCtx } from '@nktkas/hyperliquid'

interface AssetTableProps {
  filteredAssets: [string, string][]
  isFavorite: (key: string, type: 'spot' | 'perp') => boolean
  selectedAsset: string
  setSelectedAsset: (asset: string) => void
}

const AssetTable = ({
  filteredAssets,
  isFavorite,
  selectedAsset,
  setSelectedAsset
}: AssetTableProps) => {
  const [sortKey, setSortKey] = useState('market')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const type = 'perp'
  const { perpsMeta, perpAssetContext } = useHyperliquid()

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const getSortValue = (key: string, ctx: PerpsAssetCtx | undefined, assetKey: string) => {
    if (!ctx) return 0

    switch (key) {
      case 'market':
        return assetKey || ''
      case 'price':
        return ctx.midPx ?? 0
      case 'change':
        return ctx.prevDayPx
          ? ((Number(ctx.midPx) - Number(ctx.prevDayPx)) / Number(ctx.prevDayPx)) * 100
          : 0
      case 'volume':
        return ctx.dayNtlVlm ?? 0
      default:
        return 0
    }
  }

  const sortAssets = (assets: [string, string][]) => {
    if (!perpsMeta) return assets
    return [...assets].sort(([aKey], [bKey]) => {
      const ctxA = perpAssetContext[perpsMeta.universe.findIndex((a) => a.name === aKey)]
      const ctxB = perpAssetContext[perpsMeta.universe.findIndex((a) => a.name === bKey)]

      let a = getSortValue(sortKey, ctxA, aKey)
      let b = getSortValue(sortKey, ctxB, bKey)

      if (sortKey === 'market') {
        a = String(a ?? '')
        b = String(b ?? '')
        return sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
      }

      return sortOrder === 'asc' ? Number(a) - Number(b) : Number(b) - Number(a)
    })
  }

  const favoriteAssets = filteredAssets.filter(([key]) => isFavorite(key, type))
  const nonFavoriteAssets = filteredAssets.filter(([key]) => !isFavorite(key, type))

  const sortedFavorites = sortAssets(favoriteAssets)
  const sortedNonFavorites = sortAssets(nonFavoriteAssets)

  return (
    <div className="h-[300px] overflow-y-auto no-scrollbar">
      <table className="min-w-full text-white text-sm">
        <thead className="top-0 z-10 sticky text-white/70">
          <tr>
            <th
              className="group px-4 py-3 active:text-white text-left whitespace-nowrap cursor-pointer"
              onClick={() => handleSort('market')}
            >
              <div className="flex items-center gap-1">
                Market
                <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
              </div>
            </th>
            <th
              className="group px-4 py-3 active:text-white text-right whitespace-nowrap cursor-pointer"
              onClick={() => handleSort('price')}
            >
              <div className="flex justify-end items-center gap-1">
                Price
                <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
              </div>
            </th>
            <th
              className="group px-4 py-3 active:text-white text-right whitespace-nowrap cursor-pointer"
              onClick={() => handleSort('change')}
            >
              <div className="flex justify-end items-center gap-1">
                24h Change
                <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
              </div>
            </th>
            <th
              className="group px-4 py-3 active:text-white text-right whitespace-nowrap cursor-pointer"
              onClick={() => handleSort('volume')}
            >
              <div className="flex justify-end items-center gap-1">
                Volume
                <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
              </div>
            </th>
            <th
              className="group px-4 py-3 active:text-white text-right whitespace-nowrap cursor-pointer"
              onClick={() => handleSort('marketCap')}
            >
              <div className="flex justify-end items-center gap-1">
                Open Interest
                <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {[...sortedFavorites, ...sortedNonFavorites].map((item) => {
            const [key] = item
            return (
              <AssetItem
                key={key}
                assetKey={key}
                selectedAsset={selectedAsset}
                setSelectedAsset={setSelectedAsset}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default AssetTable
