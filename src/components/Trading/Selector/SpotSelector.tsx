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
import { useTranslate } from '@tolgee/react'
import { useRouter } from 'next/navigation'

interface ISelectorProps {
  selectedAsset: string
  isRTL: boolean
}

const SpotSelector = ({ selectedAsset, isRTL }: ISelectorProps) => {
  const { t } = useTranslate()
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
  const router = useRouter()
  const tabs = useMemo(
    () => [
      { label: t('All'), icon: null },
      { label: t('New'), icon: <IconRosette className="size-3" /> },
      { label: t('Favorites'), icon: <IconStarFilled className="size-3" /> },
      { label: t('AI'), icon: <IconBrain className="size-3" /> },
      { label: t('Defi'), icon: <IconAdjustmentsDollar className="size-3" /> },
      { label: t('Gaming'), icon: <IconDeviceGamepad2 className="size-3" /> },
      { label: t('Meme'), icon: <IconMeteor className="size-3" /> }
    ],
    [t]
  )

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

  const calculate24hChange = () => {
    if (!selectedAssetContext?.prevDayPx || !selectedAssetContext?.midPx) return null
    const prev = Number(selectedAssetContext.prevDayPx)
    const change = Number(selectedAssetContext.midPx) - prev
    const percent = (change / prev) * 100
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(change > 10000 ? 0 : change > 1000 ? 1 : 2)} (${sign}${percent.toFixed(change > 10000 ? 0 : change > 1000 ? 1 : 2)}%)`
  }

  const marketData = useMemo(() => {
    if (!selectedAssetContext) return []

    const changeString = calculate24hChange()

    return [
      {
        label: t('Price'),
        value: selectedAssetContext?.markPx ? (
          <ReactiveText
            className="text-xs"
            precision={3}
            value={Number(selectedAssetContext.markPx)}
            type="currency"
          />
        ) : (
          <Skeleton size="md" />
        )
      },
      {
        label: t('24h Change'),
        value: changeString ?? <Skeleton size="md" />,
        color: changeString?.includes('+') ? 'text-green' : 'text-red'
      },
      {
        label: t('24h Volume'),
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
        label: t('Market Cap'),
        value: selectedAssetContext?.midPx ? (
          <ReactiveText
            className="text-xs"
            precision={0}
            value={
              Number(selectedAssetContext.circulatingSupply) * Number(selectedAssetContext.markPx)
            }
            type="currency"
          />
        ) : (
          <Skeleton size="md" />
        )
      },
      {
        label: t('Contract'),
        value: tokenContract ? (
          <div className="group flex gap-1 cursor-pointer">
            <a
              href={`https://app.hyperliquid.xyz/explorer/token/${tokenContract}`}
              target="_blank"
              className="text-white text-xs"
            >
              {tokenContract.slice(0, 6)}...{tokenContract.slice(-4)}
            </a>{' '}
            <IconExternalLink className="w-4 h-4 text-white/70 group-hover:text-primary" />
          </div>
        ) : (
          <Skeleton size="md" />
        )
      }
    ]
  }, [selectedAssetContext, tokenContract, t])

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
      <div className={cn('flex items-center gap-2 w-full h-full', isRTL && 'flex-row-reverse')}>
        <Button
          onClick={handleToggleFavorite}
          variant="outline"
          size="icon"
          className="h-full aspect-square text-primary flex items-center justify-center cursor-pointer"
        >
          {favorites.has(selectedAsset) ? (
            <IconStarFilled className="size-4 text-primary" />
          ) : (
            <IconStar className="size-4 text-white/70" />
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
            align={isRTL ? 'end' : 'start'}
            className="w-[100vw] md:w-3xl h-80 z-30 p-2 flex bg-popover flex-col gap-2"
          >
            <div
              className={cn('flex items-center w-full h-fit gap-2', isRTL && 'flex-row-reverse')}
            >
              <Input
                type="text"
                dir={isRTL ? 'rtl' : 'ltr'}
                placeholder={t('Search for an asset')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn('p-2 focus:outline-none w-full text-start text-white text-sm')}
              />
              {/* <ToggleGroup
                size={'sm'}
                type="single"
                className={cn('bg-white/10', isRTL ? 'flex-row-reverse' : '')}
                value={isStrict ? 'Strict' : 'All'}
                onValueChange={(value) => value !== '' && setIsStrict(value === 'Strict')}
              >
                <ToggleGroupItem
                  value="Strict"
                  className={cn(
                    'px-4 py-1 cursor-pointer text-xs hover:text-green font-semibold transition-colors duration-150 focus:outline-none',
                    isStrict ? '!bg-green/10 !text-green' : 'bg-transparent text-white/70',
                    isRTL ? 'rounded-r-md' : 'rounded-l-md'
                  )}
                >
                  <IconShieldCheck className="size-4" />
                  {t('Verified')}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="All"
                  className={cn(
                    'px-4 py-1 cursor-pointer text-xs hover:text-red font-semibold transition-colors duration-150 focus:outline-none',
                    !isStrict ? '!bg-red/10 !text-red' : 'bg-transparent text-white/70',
                    isRTL ? 'rounded-l-md' : 'rounded-r-md'
                  )}
                >
                  <IconShieldQuestion className="size-4" />
                  {t('All')}
                </ToggleGroupItem>
              </ToggleGroup> */}
            </div>
            {/* <ToggleGroup
              className={cn(
                'flex items-center bg-white/10 justify-between w-full',
                isRTL ? 'flex-row-reverse' : ''
              )}
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
                    'cursor-pointer flex items-center gap-2 text-xs font-semibold transition-colors duration-150 focus:outline-none',
                    selectedTab === tab.label
                      ? '!bg-primary !text-white'
                      : 'bg-transparent text-white/70',
                    isRTL
                      ? 'first:rounded-r-md last:rounded-l-md'
                      : 'first:rounded-l-md last:rounded-r-md'
                  )}
                  key={tab.label}
                  value={tab.label}
                >
                  {!isMobile ? tab.icon : null}
                  {tab.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup> */}
            <SpotTable
              isRTL={isRTL}
              searchTerm={searchTerm}
              selectedAsset={selectedAsset}
              selectedTab={selectedTab}
              setSelectedAsset={(asset) => {
                const keyToToken = spotKeyToName.get(asset).split('/')[0]
                router.push(`/spot/${keyToToken}`)
                setIsOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
        <Separator orientation="vertical" className="hidden md:block !h-full" />
        <div
          className={cn(
            'hidden md:flex flex-nowrap gap-4 px-2 w-full items-center justify-between text-white text-xs',
            isRTL && 'flex-row-reverse'
          )}
        >
          {marketData?.map((item, index) => (
            <div key={index} className="flex flex-col flex-wrap justify-center">
              <div className="text-white/70 text-xs">{item.label}</div>
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
            <PopoverContent
              align={isRTL ? 'start' : 'end'}
              className="w-fit h-fit flex flex-col gap-4"
            >
              {marketData?.map((item, index) => (
                <div key={index} className="flex flex-col gap-1 items-end flex-wrap justify-center">
                  <div className="text-white/70 text-xs text-nowrap">{item.label}</div>
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
