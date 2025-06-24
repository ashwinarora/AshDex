'use client'
import { useEffect, useMemo, useState } from 'react'
import AssetItem from './UserData/component/AssetItem'
import { getUniverseIndex } from '@/utils/utils'
import { cn } from '@/lib/utils'
import useIsSpot from '@/hooks/useIsSpot'
import { useFavorites } from '@/context/FavoritesContext'
import Skeleton from '../common/Skeleton'
import { IconExternalLink, IconStar, IconStarFilled } from '@tabler/icons-react'
import { SpotAssetCtx as WebDataSpotAssetCtx } from '@/utils/hyperliquid/webData2Types'
import { MetaData } from '@/utils/hyperliquid/hyperLiquidTypes'
import { AssetCtx } from '@/utils/hyperliquid/webData2Types'

import { useHyperliquid } from '@/store/HyperliquidStore'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import ReactiveText from '../common/ReactiveText'
import { Button } from '../ui/button'
import {
  ArrowUpDownIcon,
  BadgePlusIcon,
  BrainCircuitIcon,
  ChevronDownIcon,
  Gamepad2Icon,
  HandCoinsIcon,
  ShieldCheckIcon,
  ShieldQuestionIcon,
  SmileIcon
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Input } from '../ui/input'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../ui/table'
import { Separator } from '../ui/separator'

interface ISelectorProps {
  selectedAsset: string
  setSelectedAsset: (asset: string) => void
}

const useCountdown = () => {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()
      const timeLeft = 24 - hours - minutes / 60 - seconds / 3600
      const formattedTime = `00:${Math.floor((timeLeft % 1) * 60)
        .toString()
        .padStart(2, '0')}:${Math.floor((((timeLeft % 1) * 60) % 1) * 60)
        .toString()
        .padStart(2, '0')}`
      setTimeLeft(formattedTime)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  return timeLeft
}

const Selector = ({ selectedAsset, setSelectedAsset }: ISelectorProps) => {
  const { allMids, perpAssetContext, spotAssetContext } = useHyperliquid()
  const { data: universe } = usePerpsUniverse()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('All')
  const [sortKey, setSortKey] = useState('market')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isStrict, setIsStrict] = useState(true)
  const isSpot = useIsSpot()
  const type = isSpot ? 'spot' : 'perp'
  const [tokenContract, setTokenContract] = useState<string>()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { data: spotMeta } = useSpotMeta()
  const selectedAssetContext = useMemo(() => {
    const coin = selectedAsset

    if (isSpot && spotMeta && spotAssetContext) {
      const spotAsset = spotMeta.tokens.find((a) => a.name === coin)
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

  const countdown = useCountdown()

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
  const tabs = [
    { label: 'All' },
    { label: 'New', icon: <BadgePlusIcon className="size-3" /> },
    { label: 'AI', icon: <BrainCircuitIcon className="size-3" /> },
    { label: 'Defi', icon: <HandCoinsIcon className="size-3" /> },
    { label: 'Gaming', icon: <Gamepad2Icon className="size-3" /> },
    { label: 'Meme', icon: <SmileIcon className="size-3" /> }
  ]

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
        value: (
          <div className="flex items-center gap-1">
            <span className={`${selectedAssetContext.funding! > 0 ? 'text-green' : 'text-red'}`}>
              {selectedAssetContext.funding!.toString()}
            </span>
            <span className="text-white/70">/</span>
            <span className="text-white">{countdown}</span>
          </div>
        ),
        color: undefined
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
    tokenContract,
    countdown
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

  return (
    <div className="flex items-center justify-between p-2 h-14 bg-secondary rounded-md">
      <div className="flex items-center gap-2 w-full h-full">
        <Button
          onClick={handleToggleFavorite}
          variant="outline"
          size="icon"
          className="h-full aspect-square text-primary flex items-center justify-center cursor-pointer"
        >
          {isFavorite(selectedAsset, type) ? (
            <IconStarFilled className="size-4 text-primary" />
          ) : (
            <IconStar className="size-4 text-white/50" />
          )}
        </Button>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="!h-fit !p-2 w-40 flex items-center justify-between gap-2"
            >
              <h1 className="text-white text-sm font-semibold">{selectedAsset}</h1>
              <ChevronDownIcon className="size-4 text-white" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-3xl h-96 z-40 p-2 flex flex-col gap-2">
            <div className="flex items-center w-full h-fit gap-2">
              <Input
                type="text"
                placeholder="Search for an asset"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 focus:outline-none w-full text-left text-white text-sm"
              />
              <ToggleGroup
                size={'sm'}
                type="single"
                className="bg-white/5"
                value={isStrict ? 'Strict' : 'All'}
                onValueChange={(value) => value !== '' && setIsStrict(value === 'Strict')}
              >
                <ToggleGroupItem
                  value="Strict"
                  className={cn(
                    'px-4 py-1 rounded-l-md cursor-pointer text-xs hover:text-green font-semibold transition-colors duration-150 focus:outline-none',
                    isStrict ? 'bg-green !text-green' : 'bg-transparent text-white/50'
                  )}
                >
                  <ShieldCheckIcon className="size-4" />
                  Verified
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="All"
                  className={cn(
                    'px-4 py-1 rounded-r-md cursor-pointer text-xs hover:text-red font-semibold transition-colors duration-150 focus:outline-none',
                    !isStrict ? 'bg-red !text-red' : 'bg-transparent text-white/50'
                  )}
                >
                  <ShieldQuestionIcon className="size-4" />
                  All
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <ToggleGroup
              className="flex items-center bg-white/5 justify-between w-full"
              type="single"
              value={selectedTab}
              onValueChange={(value) => {
                if (value === '') {
                  return
                }
                setSelectedTab(value)
              }}
            >
              {tabs.map((tab) => (
                <ToggleGroupItem
                  className={cn(
                    'first:rounded-l-md last:rounded-r-md cursor-pointer flex items-center gap-2 text-xs font-semibold transition-colors duration-150 focus:outline-none',
                    selectedTab === tab.label
                      ? 'bg-primary text-white'
                      : 'bg-transparent text-white/50'
                  )}
                  key={tab.label}
                  value={tab.label}
                >
                  {tab.icon}
                  {tab.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <AssetTable
              filteredAssets={filteredAssets}
              universe={universe}
              isFavorite={isFavorite}
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              sortKey={sortKey}
              sortOrder={sortOrder}
              handleSort={handleSort}
              setIsOpen={setIsOpen}
            />
          </PopoverContent>
        </Popover>
        <Separator orientation="vertical" className="!h-full" />
        <div className="flex gap-4 px-2 w-full items-center justify-between text-white text-xs">
          {marketData?.map((item, index) => (
            <div key={index} className="flex flex-col flex-wrap justify-center">
              <div className="text-white/50 text-xs">{item.label}</div>
              <div className={`text-xs ${item.color || 'text-white'}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
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
  isFavorite: (key: string, type: 'spot' | 'perp') => boolean
  selectedAsset: string
  setSelectedAsset: (asset: string) => void
  sortKey: string
  sortOrder: 'asc' | 'desc'
  handleSort: (key: string) => void
  setIsOpen: (open: boolean) => void
}

const AssetTable = ({
  filteredAssets,
  universe,
  isFavorite,
  selectedAsset,
  setSelectedAsset,
  sortKey,
  sortOrder,
  handleSort,
  setIsOpen
}: AssetTableProps) => {
  const isSpot = useIsSpot()
  const type = isSpot ? 'spot' : 'perp'
  const { spotAssetContext, perpAssetContext } = useHyperliquid()
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
      let ctxA = perpAssetContext[universe.findIndex((a: MetaData) => a.name === aKey)]
      let ctxB = perpAssetContext[universe.findIndex((a: MetaData) => a.name === bKey)]

      if (isSpot) {
        ctxA = spotAssetContext[universe.findIndex((a: MetaData) => a.name === aKey)]
        ctxB = spotAssetContext[universe.findIndex((a: MetaData) => a.name === bKey)]
      }
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
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead
            className="cursor-pointer hover:text-accent-foreground w-3/12"
            onClick={() => handleSort('market')}
          >
            Market
            <ArrowUpDownIcon className="size-3" />
          </TableHead>
          <TableHead
            className="cursor-pointer hover:text-accent-foreground w-2/12 justify-end"
            onClick={() => handleSort('price')}
          >
            Price
            <ArrowUpDownIcon className="size-3" />
          </TableHead>
          <TableHead
            className="cursor-pointer hover:text-accent-foreground w-3/12 justify-end"
            onClick={() => handleSort('change')}
          >
            24h Change
            <ArrowUpDownIcon className="size-3" />
          </TableHead>
          <TableHead
            className="cursor-pointer hover:text-accent-foreground w-2/12 justify-end"
            onClick={() => handleSort('volume')}
          >
            Volume
            <ArrowUpDownIcon className="size-3" />
          </TableHead>
          <TableHead
            className="cursor-pointer hover:text-accent-foreground w-2/12 justify-end"
            onClick={() => handleSort('marketCap')}
          >
            Market Cap
            <ArrowUpDownIcon className="size-3" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...sortedFavorites, ...sortedNonFavorites].map(([key]) => {
          return (
            <AssetItem
              setIsOpen={setIsOpen}
              key={key}
              assetKey={key}
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
            />
          )
        })}
      </TableBody>
    </Table>
    // <div className="h-[300px] overflow-y-auto no-scrollbar">
    //   <table className="min-w-full text-white text-sm">
    //     <thead className="top-0 z-10 sticky text-white/70">
    //       <tr>
    //         <th
    //           className="group px-4 py-3 active:text-white text-left whitespace-nowrap cursor-pointer"
    //           onClick={() => handleSort('market')}
    //         >
    //           <div className="flex items-center gap-1">
    //             Market
    //             <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
    //           </div>
    //         </th>
    //         <th
    //           className="group px-4 py-3 active:text-white text-right whitespace-nowrap cursor-pointer"
    //           onClick={() => handleSort('price')}
    //         >
    //           <div className="flex justify-end items-center gap-1">
    //             Price
    //             <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
    //           </div>
    //         </th>
    //         <th
    //           className="group px-4 py-3 active:text-white text-right whitespace-nowrap cursor-pointer"
    //           onClick={() => handleSort('change')}
    //         >
    //           <div className="flex justify-end items-center gap-1">
    //             24h Change
    //             <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
    //           </div>
    //         </th>
    //         <th
    //           className="group px-4 py-3 active:text-white text-right whitespace-nowrap cursor-pointer"
    //           onClick={() => handleSort('volume')}
    //         >
    //           <div className="flex justify-end items-center gap-1">
    //             Volume
    //             <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
    //           </div>
    //         </th>
    //         <th
    //           className="group px-4 py-3 active:text-white text-right whitespace-nowrap cursor-pointer"
    //           onClick={() => handleSort('marketCap')}
    //         >
    //           <div className="flex justify-end items-center gap-1">
    //             {type === 'spot' ? 'Market Cap' : 'Open Interest'}
    //             <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
    //           </div>
    //         </th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {[...sortedFavorites, ...sortedNonFavorites].map(([key]) => {
    //         return (
    //           <AssetItem
    //             key={key}
    //             assetKey={key}
    //             selectedAsset={selectedAsset}
    //             setSelectedAsset={setSelectedAsset}
    //           />
    //         )
    //       })}
    //     </tbody>
    //   </table>
    // </div>
  )
}
