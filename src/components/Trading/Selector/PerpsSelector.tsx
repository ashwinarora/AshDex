'use client'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { getPerpsUniverseIndex } from '@/utils/utils'
import { useFavorites } from '@/store/FavoritesStore'
import Skeleton from '../../common/Skeleton'
import {
  IconAdjustmentsDollar,
  IconBrain,
  IconChevronDown,
  IconDeviceGamepad2,
  IconMeteor,
  IconRosette,
  IconShieldCheck,
  IconShieldQuestion,
  IconStar,
  IconStarFilled
} from '@tabler/icons-react'
import { useHyperliquid } from '@/store/HyperliquidStore'
import ReactiveText from '../../common/ReactiveText'
import PerpsTable from './PerpsTable'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import PerpsCountdown from './PerpsCountdown'

interface ISelectorProps {
  selectedAsset: string
  setSelectedAsset: (asset: string) => void
}

// Memoize tabs array outside component to prevent recreation
const TABS = [
  { label: 'All', icon: null },
  { label: 'New', icon: <IconRosette className="size-3" /> },
  { label: 'AI', icon: <IconBrain className="size-3" /> },
  { label: 'Defi', icon: <IconAdjustmentsDollar className="size-3" /> },
  { label: 'Gaming', icon: <IconDeviceGamepad2 className="size-3" /> },
  { label: 'Meme', icon: <IconMeteor className="size-3" /> }
] as const

const Selector = ({ selectedAsset, setSelectedAsset }: ISelectorProps) => {
  const { perpAssetContext, perpsMeta } = useHyperliquid()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('All')
  const [isStrict, setIsStrict] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { toggleFavorite, favorites } = useFavorites(false)

  const { context: selectedAssetContext } = useMemo(() => {
    const idx = getPerpsUniverseIndex(perpsMeta?.universe || [], selectedAsset)
    return { context: perpAssetContext[idx] || null }
  }, [selectedAsset, perpsMeta, perpAssetContext])

  // Memoize market data calculation with better dependency tracking
  const marketData = useMemo(() => {
    type MarketDataItem = {
      label: string
      value: React.ReactNode
      color?: string
      hasCountdown?: boolean
    }
    if (!selectedAssetContext) return []

    const calculate24hChange = () => {
      if (!selectedAssetContext?.prevDayPx || !selectedAssetContext?.midPx) return null
      const prev = Number(selectedAssetContext.prevDayPx)
      const change = Number(selectedAssetContext.midPx) - prev
      const percent = (change / prev) * 100
      const sign = change >= 0 ? '+' : ''
      return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`
    }

    const changeString = calculate24hChange()
    const data: MarketDataItem[] = [
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
              value={
                Number(selectedAssetContext.openInterest!) * Number(selectedAssetContext.oraclePx!)
              }
              type="currency"
            />
          ) : (
            <Skeleton size="md" />
          )
      }
    ]

    // Only add funding if the asset has funding data
    if ('funding' in selectedAssetContext && selectedAssetContext.funding !== undefined) {
      data.splice(data.length - 1, 0, {
        label: 'Funding/Countdown',
        value: (
          <div className="flex items-center gap-1">
            <span
              className={`${Number(selectedAssetContext.funding!) > 0 ? 'text-green' : 'text-red'}`}
            >
              {(Number(selectedAssetContext.funding!) * 100).toFixed(4)}%
            </span>
            <span className="text-white/70">/</span>
            <span className="text-white">
              {/* PerpsCountdown will be rendered conditionally in JSX */}
            </span>
          </div>
        ),
        color: undefined,
        hasCountdown: true
      })
    }

    return data
  }, [selectedAssetContext])

  // Memoize the favorite toggle handler
  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      toggleFavorite(selectedAsset)
    },
    [selectedAsset, toggleFavorite]
  )

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!panelRef.current || !panelRef.current.contains(target))
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [])

  return (
    <div className="flex items-center justify-between p-2 h-14 bg-secondary rounded-md">
      <div className="flex items-center gap-2 w-full h-full">
        <Button
          onClick={handleToggleFavorite}
          variant="outline"
          size="icon"
          className="h-full aspect-square text-primary flex items-center justify-center cursor-pointer"
        >
          {favorites.has(selectedAsset) ? (
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
              <IconChevronDown className="size-4 text-white" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-xl md:w-3xl h-96 bg-accent z-30 p-2 flex flex-col gap-2"
          >
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
                    isStrict ? '!bg-green/10 !text-green' : 'bg-transparent text-white/50'
                  )}
                >
                  <IconShieldCheck className="size-4" />
                  Verified
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="All"
                  className={cn(
                    'px-4 py-1 rounded-r-md cursor-pointer text-xs hover:text-red font-semibold transition-colors duration-150 focus:outline-none',
                    !isStrict ? '!bg-red/10 !text-red' : 'bg-transparent text-white/50'
                  )}
                >
                  <IconShieldQuestion className="size-4" />
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
              {TABS.map((tab) => (
                <ToggleGroupItem
                  className={cn(
                    'first:rounded-l-md last:rounded-r-md cursor-pointer flex items-center gap-2 text-xs font-semibold transition-colors duration-150 focus:outline-none',
                    selectedTab === tab.label
                      ? '!bg-primary !text-white'
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
            <PerpsTable
              searchTerm={searchTerm}
              setIsOpen={setIsOpen}
              selectedAsset={selectedAsset}
              setSelectedAsset={(asset) => {
                setSelectedAsset(asset)
                setIsOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
        <Separator orientation="vertical" className="!h-full" />
        <div className="hidden md:flex gap-4 px-2 w-full items-center justify-between text-white text-xs">
          {marketData?.map((item, index) => (
            <div key={index} className="flex flex-col flex-wrap justify-center">
              <div className="text-white/50 text-xs">{item.label}</div>
              <div className={`text-xs ${item.color || 'text-white'}`}>
                {item.hasCountdown ? (
                  <div className="flex items-center gap-1">
                    <span
                      className={`${Number(selectedAssetContext?.funding || 0) > 0 ? 'text-green' : 'text-red'}`}
                    >
                      {(Number(selectedAssetContext?.funding || 0) * 100).toFixed(4)}%
                    </span>
                    <span className="text-white/70">/</span>
                    <span className="text-white">
                      <PerpsCountdown />
                    </span>
                  </div>
                ) : (
                  item.value
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Selector
