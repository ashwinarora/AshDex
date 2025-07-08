'use client'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { getSpotAssetContext } from '@/utils/utils'
import { useFavorites } from '@/store/FavoritesStore'
import Skeleton from '../../common/Skeleton'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import ReactiveText from '../../common/ReactiveText'
import SpotTable from './SpotTable'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  IconAdjustmentsDollar,
  IconExternalLink,
  IconBrain,
  IconChevronDown,
  IconDeviceGamepad2,
  IconMeteor,
  IconRosette,
  IconShieldCheck,
  IconShieldQuestion,
  IconStar,
  IconStarFilled,
  IconInfoCircle
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useScreenSize } from '@/hooks/useScreenSize'
import { useShallow } from 'zustand/react/shallow'

interface ISelectorProps {
  selectedAsset: string
  setSelectedAsset: (asset: string) => void
}

const tabs = [
  { label: 'All', icon: null },
  { label: 'New', icon: <IconRosette className="size-3" /> },
  { label: 'AI', icon: <IconBrain className="size-3" /> },
  { label: 'Defi', icon: <IconAdjustmentsDollar className="size-3" /> },
  { label: 'Gaming', icon: <IconDeviceGamepad2 className="size-3" /> },
  { label: 'Meme', icon: <IconMeteor className="size-3" /> }
] as const

const SpotSelector = ({ selectedAsset, setSelectedAsset }: ISelectorProps) => {
  const { spotAssetContext } = useHyperliquidStore(
    useShallow((state) => ({
      spotAssetContext: state.spotAssetContext
    }))
  )
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('All')
  const [isStrict, setIsStrict] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [tokenContract, setTokenContract] = useState<string>()
  const { toggleFavorite, favorites } = useFavorites(true)
  const { data: spotMeta, spotKeyToName, spotKeyToBaseName } = useSpotMeta()
  const { isMobile } = useScreenSize()

  const selectedAssetContext = useMemo(() => {
    if (spotMeta && spotAssetContext) {
      const spot = getSpotAssetContext({
        asset: selectedAsset,
        spotMeta,
        spotAssetContext
      })
      setTokenContract(spot?.meta?.tokenId)
      return spot?.context
    }
    return null
  }, [selectedAsset, spotAssetContext, spotMeta])

  const marketData = useMemo(() => {
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

    return [
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
            value={Number(Number(selectedAssetContext.midPx))}
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
  }, [selectedAssetContext, tokenContract])

  // Memoize the favorite toggle handler
  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      toggleFavorite(selectedAsset)
    },
    [selectedAssetContext, selectedAsset, marketData, toggleFavorite]
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
              className="h-full md:!h-fit !p-2 w-full flex-1 md:w-40 flex items-center justify-between gap-2"
            >
              <h1 className="text-white text-sm font-semibold">
                {spotKeyToName.get(selectedAsset)}/{spotKeyToBaseName.get(selectedAsset)}
              </h1>
              <IconChevronDown className="size-4 text-white" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[100vw] md:w-3xl h-96 z-30 p-2 flex bg-accent flex-col gap-2"
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
              {tabs.map((tab) => (
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
                  {!isMobile ? tab.icon : null}
                  {tab.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <SpotTable
              searchTerm={searchTerm}
              selectedAsset={selectedAsset}
              setSelectedAsset={(asset) => {
                setSelectedAsset(asset)
                setIsOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
        <Separator orientation="vertical" className="hidden md:block!h-full" />
        <div className="hidden md:flex gap-4 px-2 w-full items-center justify-between text-white text-xs">
          {marketData?.map((item, index) => (
            <div key={index} className="flex flex-col flex-wrap justify-center">
              <div className="text-white/50 text-xs">{item.label}</div>
              <div className={`text-xs ${item.color || 'text-white'}`}>{item.value}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-1 h-full md:hidden items-center justify-end gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                disabled={marketData.length === 0}
                variant="outline"
                size="icon"
                className="h-fit aspect-square flex items-center justify-center cursor-pointer"
              >
                <IconInfoCircle className="size-4 text-white" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-fit h-fit flex flex-col gap-4">
              {marketData?.map((item, index) => (
                <div key={index} className="flex flex-col gap-1 items-end flex-wrap justify-center">
                  <div className="text-white/50 text-xs text-nowrap">{item.label}</div>
                  <div className={`text-xs text-nowrap ${item.color || 'text-white'}`}>
                    {item.value}
                  </div>
                </div>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}

export default SpotSelector
