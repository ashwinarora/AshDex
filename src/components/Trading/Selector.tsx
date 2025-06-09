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
import {
  IconExternalLink,
  IconSearch,
  IconSelector,
  IconStar,
  IconStarFilled
} from '@tabler/icons-react'
import { Token } from '@/hooks/usePerpetualData'
import { SpotAssetCtx as WebDataSpotAssetCtx } from '@/utils/hyperliquid/webData2Types'
import { MetaData } from '@/utils/hyperliquid/hyperLiquidTypes'
import { AssetCtx } from '@/utils/hyperliquid/webData2Types'

import { useHyperliquid } from '@/store/HyperliquidStore'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import ReactiveText from '../common/ReactiveText'

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
  const [isStrict, setIsStrict] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const isSpot = useIsSpot()
  const type = isSpot ? 'spot' : 'perp'
  const [tokenContract, setTokenContract] = useState<string>()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { data: spotMeta } = useSpotMeta()
  const selectedAssetContext = useMemo(() => {
    const coin = selectedAsset

    if (isSpot && spotMeta && spotAssetContext) {
      const spotAsset = spotMeta.tokens.find((a: Token) => a.name === coin)
      if (!spotAsset) return null

      const spotUniverse = spotMeta.universe.find(
        (a: { tokens: number[]; index: number }) => a.tokens[0] === spotAsset.index
      )
      if (!spotUniverse) return null

      setTokenContract(spotAsset.tokenId)
      const spotToken = spotAssetContext[spotUniverse.index]
      if (!spotToken) return null

      const coinDetails = spotAssetContext.find((a) => a.coin.includes(spotToken.coin))
      return coinDetails || null
    }
    const idx = getUniverseIndex(universe, selectedAsset)
    return perpAssetContext[idx] || null
  }, [selectedAsset, universe, perpAssetContext, spotAssetContext, isSpot, spotMeta])

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
    [allMids, searchTerm, isSpot, categoryMap, selectedTab]
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
    let data = [
      {
        label: 'Oracle',
        value:
          'oraclePx' in selectedAssetContext && selectedAssetContext.oraclePx ? (
            <ReactiveText
              className="text-xs"
              precision={2}
              value={Number(selectedAssetContext.oraclePx!)}
              type="currency"
            />
          ) : (
            <Skeleton size="md" />
          )
      },
      {
        label: '24h Change',
        value: changeString ?? <Skeleton size="md" />,
        color: changeString?.includes('+') ? 'text-green' : 'text-red'
      },
      {
        label: '24h Volume',
        value: selectedAssetContext?.dayNtlVlm ? (
          <ReactiveText
            className="text-xs"
            precision={0}
            value={Number(selectedAssetContext?.dayNtlVlm)}
            type="currency"
          />
        ) : (
          <Skeleton size="md" />
        )
      },
      {
        label: 'Open Interest',
        value:
          'openInterest' in selectedAssetContext &&
          selectedAssetContext.openInterest &&
          selectedAssetContext.oraclePx ? (
            <ReactiveText
              className="text-xs"
              precision={0}
              value={Number(selectedAssetContext.openInterest! * selectedAssetContext.oraclePx!)}
              type="currency"
            />
          ) : (
            <Skeleton size="md" />
          )
      }
    ]
    if (isSpot) {
      data = [
        {
          label: '24h Change',
          value: changeString ?? <Skeleton size="md" />,
          color: changeString?.includes('+') ? 'text-green' : 'text-red'
        },
        {
          label: '24h Volume',
          value: selectedAssetContext?.dayNtlVlm ? (
            <ReactiveText
              className="text-xs"
              precision={0}
              value={Number(selectedAssetContext?.dayNtlVlm)}
              type="currency"
            />
          ) : (
            <Skeleton size="md" />
          )
        },
        {
          label: 'Market Cap',
          value: selectedAssetContext?.midPx ? (
            <ReactiveText
              className="text-xs"
              precision={0}
              value={Number(
                (selectedAssetContext as WebDataSpotAssetCtx).circulatingSupply *
                  selectedAssetContext.midPx
              )}
              type="currency"
            />
          ) : (
            <Skeleton size="md" />
          )
        },
        {
          label: 'Contract',
          value: tokenContract ? (
            <div className="group flex gap-1 cursor-pointer">
              <a
                href={`https://app.hyperliquid.xyz/explorer/token/${tokenContract}`}
                target="_blank"
                className="text-white text-xs"
              >
                {tokenContract.slice(0, 6)}...{tokenContract.slice(-4)}
              </a>{' '}
              <IconExternalLink className="w-4 h-4 text-white/50 group-hover:text-primary" />
            </div>
          ) : (
            <Skeleton size="md" />
          )
        }
      ]
    }
    if ('funding' in selectedAssetContext && selectedAssetContext.funding !== undefined) {
      data.splice(data.length - 1, 0, {
        label: 'Funding/Countdown',
        value: selectedAssetContext.funding!.toString() ?? <Skeleton size="md" />,
        color: 'text-green'
      })
    }

    return data
  }, [
    perpAssetContext,
    spotAssetContext,
    isSpot,
    selectedAssetContext,
    allMids,
    selectedAsset,
    tokenContract
  ])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
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
        <div className="flex items-center px-2">
          <button
            onClick={handleToggleFavorite}
            className="focus:outline-none w-5 h-5 text-primary hover:scale-105 cursor-pointer"
          >
            {isFavorite(selectedAsset, type) ? (
              <IconStarFilled size={16} className="mr-1" />
            ) : (
              <IconStar size={16} className="opacity-50 mr-1 text-white" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-x-2 text-white text-lg cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="text-white text-sm text-nowrap">
                {selectedAsset || 'Select an asset'}
              </span>
            </div>
            <Image width={20} height={20} src={arrowdownicon} alt="arrowdown" className="w-3 h-3" />
          </button>
        </div>
        {!isSpot ? (
          <div className="flex flex-col p-4">
            <p className="text-white/70 text-xs">Mark Price</p>
            <ValueIndicator value={selectedAssetContext?.midPx} className="text-xs" />
          </div>
        ) : (
          <div className="flex flex-col p-4">
            <p className="text-white/70 text-xs">Price</p>
            <ValueIndicator value={allMids[selectedAsset]} className="text-xs" />
          </div>
        )}
      </div>

      <div className="flex gap-4 text-white text-xs">
        {marketData?.map((item, index) => (
          <div key={index} className="flex flex-col flex-wrap justify-center">
            <div className="text-white/70 text-xs">{item.label}</div>
            <div className={`font-medium text-xs ${item.color || 'text-white'}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {isOpen && (
        <div className="top-9 left-2 z-50 absolute flex flex-col gap-3 bg-[#211134] shadow-xl mt-8 p-4 border-2 border-white/5 rounded-xl w-[90%] max-w-[95vw]">
          <div className="flex justify-between items-center">
            <div className="flex items-center bg-[#FFFFFF08] px-4 border border-white/5 rounded-md w-full">
              <IconSearch className="w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder='e.g. "BTC" or "Bitcoin"'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent p-2 focus:outline-none w-full text-white text-sm"
              />
            </div>
            <div className="relative flex justify-between bg-white/5 m-3 p-1 py-3 rounded-md w-1/4 h-10 overflow-hidden">
              {/* Sliding background */}
              <div
                className={`absolute top-0 left-0 z-10 h-[100%]  w-1/2 rounded-md transition-all duration-200 ${
                  isStrict ? 'translate-x-0 bg-green' : 'translate-x-full bg-red'
                }`}
              ></div>

              {/* Buy Button */}
              <p
                className="z-20 flex justify-center items-center w-1/2 font-medium text-white text-sm cursor-pointer"
                onClick={() => setIsStrict(true)}
              >
                Strict
              </p>

              {/* Sell Button */}
              <p
                className="z-20 flex justify-center items-center w-1/2 font-medium text-white text-sm cursor-pointer"
                onClick={() => setIsStrict(false)}
              >
                All
              </p>
            </div>
          </div>

          <div className="flex gap-2 bg-white/2 px-3 py-2 rounded-md w-max">
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
            type={type}
            sortKey={sortKey}
            sortOrder={sortOrder}
            handleSort={handleSort}
            selectedAssetContext={selectedAssetContext}
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
interface AssetTableProps {
  filteredAssets: [string, number][]
  universe: MetaData[]
  perpAssetContext: AssetCtx[]
  isFavorite: (key: string, type: 'spot' | 'perp') => boolean
  selectedAsset: string
  setSelectedAsset: (asset: string) => void
  type: 'spot' | 'perp'
  sortKey: string
  sortOrder: 'asc' | 'desc'
  handleSort: (key: string) => void
  selectedAssetContext: AssetCtx | null
}

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
  handleSort,
  selectedAssetContext
}: AssetTableProps) => {
  const getSortValue = (key: string, ctx: AssetCtx | undefined, assetKey: string) => {
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

  const sortAssets = (assets: [string, number][]) =>
    [...assets].sort(([aKey], [bKey]) => {
      const ctxA = perpAssetContext[universe.findIndex((a: MetaData) => a.name === aKey)]
      const ctxB = perpAssetContext[universe.findIndex((a: MetaData) => a.name === bKey)]

      let a = getSortValue(sortKey, ctxA, aKey)
      let b = getSortValue(sortKey, ctxB, bKey)

      if (sortKey === 'market') {
        a = String(a ?? '')
        b = String(b ?? '')
        return sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
      }

      return sortOrder === 'asc' ? Number(a) - Number(b) : Number(b) - Number(a)
    })

  const favoriteAssets = filteredAssets.filter(([key]) => isFavorite(key, type))
  const nonFavoriteAssets = filteredAssets.filter(([key]) => !isFavorite(key, type))

  const sortedFavorites = sortAssets(favoriteAssets)
  const sortedNonFavorites = sortAssets(nonFavoriteAssets)

  return (
    <div className="h-[300px] overflow-y-auto no-scrollbar">
      <table className="min-w-full text-white text-sm">
        <thead className="top-0 z-10 sticky bg-secondary text-white/70">
          <tr>
            <th
              className="group px-4 py-3 w-[20%] active:text-white text-left whitespace-nowrap cursor-pointer"
              onClick={() => handleSort('market')}
            >
              <div className="flex items-center gap-1">
                Market
                <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
              </div>
            </th>
            <th
              className="group px-4 py-3 w-[20%] active:text-white text-right whitespace-nowrap cursor-pointer"
              onClick={() => handleSort('price')}
            >
              <div className="flex justify-end items-center gap-1">
                Price
                <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
              </div>
            </th>
            <th
              className="group px-4 py-3 w-[20%] active:text-white text-right whitespace-nowrap cursor-pointer"
              onClick={() => handleSort('change')}
            >
              <div className="flex justify-end items-center gap-1">
                24h Change
                <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
              </div>
            </th>
            <th
              className="group px-4 py-3 w-[20%] active:text-white text-right whitespace-nowrap cursor-pointer"
              onClick={() => handleSort('volume')}
            >
              <div className="flex justify-end items-center gap-1">
                Volume
                <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
              </div>
            </th>
            <th
              className="group px-4 py-3 w-[20%] active:text-white text-right whitespace-nowrap cursor-pointer"
              onClick={() => handleSort('marketCap')}
            >
              <div className="flex justify-end items-center gap-1">
                {type === 'spot' ? 'Market Cap' : 'Open Interest'}
                <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {[...sortedFavorites, ...sortedNonFavorites].map(([key, value]) => {
            const assetIndex = universe.findIndex((a: MetaData) => a.name === key)
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
                selectedAssetContext={selectedAssetContext}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
