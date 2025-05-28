'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import arrowdownicon from '@/assets/images/arrowdown_icon.svg'
import AssetItem from './UserData/component/AssetItem'
import { getUniverseIndex } from '@/utils/utils'
import ValueIndicator from '../common/ValueIndicator'
import useIsSpot from '@/hooks/useIsSpot'
import { useFavorites } from '@/context/FavoritesContext'
import btcIcon from '@/assets/images/bitcoin_logo.svg'
import Skeleton from '../common/Skeleton'
import { IconSearch, IconStar, IconStarFilled } from '@tabler/icons-react'

import { useHyperliquid } from '@/store/HyperliquidStore'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'

const CRYPTO_ICONS: Record<string, StaticImageData> = {
  'BTC-PERP': btcIcon
}

interface ISelectorProps {
  selectedAsset: string
  setSelectedAsset: (asset: string) => void
}

const Selector = ({ selectedAsset, setSelectedAsset }: ISelectorProps) => {
  const { allMids, perpAssetContext, spotAssetContext } = useHyperliquid()
  const { data: universe } = usePerpsUniverse()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('All')
  const [sortKey, setSortKey] = useState('market')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const containerRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const isSpot = useIsSpot()
  const type = isSpot ? 'spot' : 'perp'

  const { isFavorite, toggleFavorite } = useFavorites()

  const selectedAssetContext = useMemo(() => {
    if (isSpot) {
      return spotAssetContext.find((a) => a.coin.includes(selectedAsset))
    }
    const idx = getUniverseIndex(universe, selectedAsset)
    return perpAssetContext[idx]
  }, [selectedAsset, universe, perpAssetContext, spotAssetContext, isSpot])

  const categoryMap: Record<string, string> = {
    'BTC-PERP': 'defi',
    'ETH-PERP': 'defi',
    'SOL-PERP': 'gaming',
    'DOGE-PERP': 'meme',
    'INJ-PERP': 'ai',
    'ARB-PERP': 'defi',
    'AXS-PERP': 'gaming',
    'PEPE-PERP': 'meme'
    // Add all your assets here with the appropriate categories
  }
  const tabs = ['All', 'Recently Listed', 'AI', 'Defi', 'Gaming', 'Meme']

  const filteredAssets = useMemo(
    () =>
      Object.entries(allMids)
        .filter(([key]) => !key.startsWith('@'))
        .filter(([key]) => key.includes(isSpot ? 'SPOT' : 'PERP'))
        .filter(([key]) => key.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(([key]) => selectedTab === 'All' || categoryMap[key] === selectedTab.toLowerCase()),
    [allMids, searchTerm, isSpot]
  )

  const marketData = useMemo(() => {
    if (!selectedAssetContext) return []
    const calculate24hChange = () => {
      if (!selectedAssetContext?.prevDayPx || !selectedAssetContext?.midPx) return null
      const prev = selectedAssetContext.prevDayPx
      const change = selectedAssetContext.midPx - prev
      const percent = (change / prev) * 100
      const sign = change >= 0 ? '+' : ''
      return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`
    }

    const changeString = calculate24hChange()
    const data = [
      {
        label: 'Oracle',
        value: changeString ?? <Skeleton size="md" />,
        color: changeString?.includes('+') ? 'text-green' : 'text-red'
      },
      {
        label: '24h Change',
        value: changeString ?? <Skeleton size="md" />,
        color: changeString?.includes('+') ? 'text-green' : 'text-red'
      },
      {
        label: '24h Volume',
        value: selectedAssetContext?.dayNtlVlm?.toFixed(2) ?? <Skeleton size="md" />
      },
      {
        label: 'Open Interest',
        value: selectedAssetContext?.dayNtlVlm?.toFixed(2) ?? <Skeleton size="md" />
      }
    ]

    if ('funding' in selectedAssetContext) {
      data.splice(data.length - 1, 0, {
        label: 'Funding/Countdown',
        value: selectedAssetContext.funding.toString() ?? <Skeleton size="md" />,
        color: 'text-green'
      })
    }

    return data
  }, [selectedAssetContext])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const handleAssetSelect = (assetKey: string) => {
    setSelectedAsset(assetKey)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    const assetPrice = selectedAssetContext?.midPx
      ? String(selectedAssetContext.midPx)
      : String(allMids[selectedAsset] || '0')
    const change24hItem = marketData.find((i) => i.label === '24h Change')
    const change24hValue = typeof change24hItem?.value === 'string' ? change24hItem.value : '0.00%'
    toggleFavorite(
      {
        name: selectedAsset,
        value: assetPrice,
        index: selectedAsset,
        price: assetPrice,
        change24h: change24hValue
      },
      type
    )
  }

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`flex items-center ${isOpen || isSettingsOpen ? 'z-50' : ''} nexon-card`}
    >
      <div className="flex max-xl:border-white/10 max-xl:border-b max-xl:w-full">
        <div className="flex items-center px-1 gap-x-3 2xl:gap-x-3 2xl:p-4 max-sm:px-2 max-lg:px-6 ">
          <button
            onClick={handleToggleFavorite}
            className="w-5 h-5 text-yellow-500 cursor-pointer focus:outline-none hover:text-yellow-600"
          >
            {isFavorite(selectedAsset, type) ? (
              <IconStarFilled size={16} className="mr-1" />
            ) : (
              <IconStar size={16} className="mr-1" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center text-lg text-white cursor-pointer gap-x-2"
          >
            <div className="flex flex-col">
              <span className="text-white text-nowrap">{selectedAsset || 'Select an asset'}</span>
              <span className="hidden opacity-60 font-medium text-[#E8E0F1] text-[13px] text-left">
                Bitcoin price
              </span>
            </div>
            <Image
              width={20}
              height={20}
              src={arrowdownicon}
              alt="arrowdown"
              className="w-3 h-3 mx-2"
            />
          </button>
        </div>
        <div className="flex flex-col p-4">
          <p className="text-xs text-white/70">Mark Price</p>
          <ValueIndicator value={selectedAssetContext?.midPx} className="text-xs font-normal" />
        </div>
      </div>

      <div className="flex text-sm text-white">
        {marketData?.map((item, index) => (
          <div key={index} className="flex flex-col flex-wrap justify-center px-4 ">
            <div className="text-xs text-white/70">{item.label}</div>
            <div className={`font-medium text-xs ${item.color || 'text-white'}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {isOpen && (
        <div className="absolute top-9 left-2 z-50 bg-secondary shadow-xl mt-8 border-2 border-white/5 rounded-xl w-[800px] max-w-[95vw] p-4 flex flex-col gap-3">
          {/* Search */}
          <div className="flex items-center bg-[#FFFFFF08] px-4 border border-white/5 rounded-md">
            <IconSearch className="w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder='e.g. "BTC" or "Bitcoin"'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 text-sm text-white bg-transparent focus:outline-none"
            />
          </div>
          <div className="flex gap-2 px-3 py-2 rounded-md bg-white/2 w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`text-white rounded-md transition-all duration-200 cursor-pointer py-1 px-3 ${
                  selectedTab === tab ? 'bg-primary font-medium' : 'hover:bg-[#FFFFFF20]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Table with sorting */}
          <AssetTable
            filteredAssets={filteredAssets}
            universe={universe}
            perpAssetContext={perpAssetContext}
            isFavorite={isFavorite}
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
            handleAssetSelect={handleAssetSelect}
            type={type}
            sortKey={sortKey}
            sortOrder={sortOrder}
            handleSort={handleSort}
          />
        </div>
      )}
    </div>
  )
}

export default Selector

// ----------------------------------
// 🧩 Separated Table Component Below
// ----------------------------------
const AssetTable = ({
  filteredAssets,
  universe,
  perpAssetContext,
  isFavorite,
  selectedAsset,
  setSelectedAsset,
  type,
  sortKey,
  sortOrder,
  handleSort
}) => {
  const getSortValue = (key, ctx, assetKey) => {
    if (!ctx) return 0

    switch (key) {
      case 'market':
        return assetKey || ''
      case 'price':
        return ctx.midPx ?? 0
      case 'change':
        return ctx.prevDayPx ? ((ctx.midPx - ctx.prevDayPx) / ctx.prevDayPx) * 100 : 0
      case 'volume':
        return ctx.dayNtlVlm ?? 0
      case 'marketCap':
        return ctx.marketCap ?? 0
      default:
        return 0
    }
  }

  const sortAssets = (assets) =>
    [...assets].sort(([aKey], [bKey]) => {
      const ctxA = perpAssetContext[universe.findIndex((a) => a.name === aKey)]
      const ctxB = perpAssetContext[universe.findIndex((a) => a.name === bKey)]

      let a = getSortValue(sortKey, ctxA, aKey)
      let b = getSortValue(sortKey, ctxB, bKey)

      if (sortKey === 'market') {
        a = String(a ?? '')
        b = String(b ?? '')
        return sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
      }

      return sortOrder === 'asc' ? a - b : b - a
    })

  const favoriteAssets = filteredAssets.filter(([key]) => isFavorite(key, type))
  const nonFavoriteAssets = filteredAssets.filter(([key]) => !isFavorite(key, type))

  const sortedFavorites = sortAssets(favoriteAssets)
  const sortedNonFavorites = sortAssets(nonFavoriteAssets)

  return (
    <div className="h-[300px] overflow-y-auto">
      <table className="min-w-full text-sm text-white">
        <thead className="sticky top-0 z-10 bg-secondary text-white/70">
          <tr>
            <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('market')}>
              Market
            </th>
            <th className="px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('price')}>
              Price
            </th>
            <th
              className="px-6 py-3 text-right cursor-pointer"
              onClick={() => handleSort('change')}
            >
              24h Change
            </th>
            <th
              className="px-6 py-3 text-right cursor-pointer"
              onClick={() => handleSort('volume')}
            >
              Volume
            </th>
            <th
              className="px-6 py-3 text-right cursor-pointer"
              onClick={() => handleSort('marketCap')}
            >
              Market Cap
            </th>
          </tr>
        </thead>
        <tbody>
          {[...sortedFavorites, ...sortedNonFavorites].map(([key, value]) => {
            const assetIndex = universe.findIndex((a) => a.name === key)
            const ctx = assetIndex !== -1 ? perpAssetContext[assetIndex] : null

            let change24h = '0.00%'
            if (ctx?.prevDayPx && ctx?.midPx) {
              const change = ctx.midPx - ctx.prevDayPx
              const percentage = (change / ctx.prevDayPx) * 100
              change24h = `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`
            }

            return (
              <AssetItem
                key={key}
                assetKey={key}
                value={value}
                selectedAsset={selectedAsset}
                setSelectedAsset={setSelectedAsset}
                icons={CRYPTO_ICONS}
                isInSelectorDropdown={true}
                price={value}
                change24h={change24h}
                type={type}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
