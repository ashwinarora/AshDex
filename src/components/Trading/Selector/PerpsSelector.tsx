'use client'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { getPerpsUniverseIndex } from '@/utils/utils'
import { useFavorites } from '@/store/FavoritesStore'
import { Skeleton } from '../../ui/skeleton'
import {
  // IconAdjustmentsDollar,
  // IconBrain,
  IconChevronDown,
  // IconDeviceGamepad2,
  IconInfoCircle,
  // IconMeteor,
  // IconRosette,
  IconStar,
  IconStarFilled
} from '@tabler/icons-react'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import ReactiveText from '../../reactive-text'
import PerpsTable from './PerpsTable'
import { Separator } from '@/components/ui/separator'
// import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
// import { useScreenSize } from '@/hooks/useScreenSize'
import PerpsCountdown from './PerpsCountdown'
import { useShallow } from 'zustand/react/shallow'
import clsx from 'clsx'
import { useTranslate } from '@tolgee/react'
import { useRouter } from 'next/navigation'

interface ISelectorProps {
  selectedAsset: string
  isRTL: boolean
}

const Selector = ({ selectedAsset, isRTL }: ISelectorProps) => {
  const { t } = useTranslate()

  // const TABS = useMemo(
  //   () => [
  //     { label: t('All'), icon: null },
  //     { label: t('New'), icon: <IconRosette className="size-3" /> },
  //     { label: t('Favorites'), icon: <IconStarFilled className="size-3" /> },
  //     { label: t('AI'), icon: <IconBrain className="size-3" /> },
  //     { label: t('Defi'), icon: <IconAdjustmentsDollar className="size-3" /> },
  //     { label: t('Gaming'), icon: <IconDeviceGamepad2 className="size-3" /> },
  //     { label: t('Meme'), icon: <IconMeteor className="size-3" /> }
  //   ],
  //   [t]
  // )

  const { perpAssetContext, perpsMeta } = useHyperliquidStore(
    useShallow((state) => ({
      perpAssetContext: state.perpAssetContext,
      perpsMeta: state.perpsMeta
    }))
  )
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  // const [selectedTab, setSelectedTab] = useState('All')
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { toggleFavorite, favorites } = useFavorites(false)
  const router = useRouter()
  const { context: selectedAssetContext } = useMemo(() => {
    const idx = getPerpsUniverseIndex(perpsMeta?.universe || [], selectedAsset)
    return { context: perpAssetContext[idx] || null }
  }, [selectedAsset, perpsMeta, perpAssetContext])

  const calculate24hChange = () => {
    if (!selectedAssetContext?.prevDayPx || !selectedAssetContext?.midPx) return null
    const prev = Number(selectedAssetContext.prevDayPx)
    const change = Number(selectedAssetContext.midPx) - prev
    const percent = (change / prev) * 100
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(change > 10000 ? 0 : change > 1000 ? 1 : 2)} (${sign}${percent.toFixed(change > 10000 ? 0 : change > 1000 ? 1 : 2)}%)`
  }

  // Memoize market data calculation with better dependency tracking
  const marketData = useMemo(() => {
    type MarketDataItem = {
      label: string
      value: React.ReactNode
      color?: string
      hasCountdown?: boolean
    }
    if (!selectedAssetContext) return []

    const changeString = calculate24hChange()
    const data: MarketDataItem[] = [
      {
        label: t('Mark Price'),
        value: selectedAssetContext?.markPx ? (
          <ReactiveText
            className="text-inherit"
            precision={2}
            value={Number(selectedAssetContext.markPx)}
            type="currency"
          />
        ) : (
          <Skeleton />
        )
      },
      {
        label: t('Oracle Price'),
        value:
          'oraclePx' in selectedAssetContext && selectedAssetContext.oraclePx ? (
            <ReactiveText
              className="text-inherit"
              precision={2}
              value={Number(selectedAssetContext.oraclePx!)}
              type="currency"
            />
          ) : (
            <Skeleton />
          )
      },
      {
        label: t('24h Change'),
        value: changeString ?? <Skeleton />,
        color: changeString?.includes('+') ? 'text-green' : 'text-red'
      },
      {
        label: t('24h Volume'),
        value: selectedAssetContext?.dayNtlVlm ? (
          <ReactiveText
            className="text-inherit"
            precision={0}
            value={Number(selectedAssetContext?.dayNtlVlm)}
            type="currency"
          />
        ) : (
          <Skeleton />
        )
      },
      {
        label: t('Open Interest'),
        value:
          'openInterest' in selectedAssetContext &&
          selectedAssetContext.openInterest &&
          selectedAssetContext.oraclePx ? (
            <ReactiveText
              className="text-inherit"
              precision={0}
              value={
                Number(selectedAssetContext.openInterest!) * Number(selectedAssetContext.oraclePx!)
              }
              type="currency"
            />
          ) : (
            <Skeleton />
          )
      }
    ]

    // Only add funding if the asset has funding data
    if ('funding' in selectedAssetContext && selectedAssetContext.funding !== undefined) {
      data.splice(data.length - 1, 0, {
        label: t('Funding/Countdown'),
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
  }, [selectedAssetContext, t])

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
    <div className={clsx('flex items-center justify-between p-2 h-14 bg-secondary rounded-md')}>
      <div
        className={clsx('flex items-center gap-2 w-full h-full', isRTL ? 'flex-row-reverse' : '')}
      >
        <Button
          onClick={handleToggleFavorite}
          variant="outline"
          size="icon"
          className="h-fit aspect-square flex items-center justify-center cursor-pointer"
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
              className="!h-fit !p-2 w-36 flex items-center justify-between gap-2"
            >
              <h1 className="text-white text-sm font-semibold">{selectedAsset}-USD</h1>
              <IconChevronDown className="size-4 text-white" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align={isRTL ? 'end' : 'start'}
            className="w-[100vw] md:w-3xl h-96 bg-popover z-30 p-2 flex flex-col gap-2"
          >
            <div className="flex items-center w-full h-fit gap-2">
              <Input
                type="text"
                dir={isRTL ? 'rtl' : 'ltr'}
                placeholder={t('Search for an asset')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn('p-2 focus:outline-none w-full text-start text-white text-sm')}
              />
            </div>
            {/* <ToggleGroup
              className={cn(
                'flex items-center bg-white/10 justify-between w-full',
                isRTL && 'flex-row-reverse'
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
              {TABS.map((tab) => (
                <ToggleGroupItem
                  className={cn(
                    'cursor-pointer flex items-center gap-2 text-xs font-semibold transition-colors duration-150 focus:outline-none',
                    isRTL
                      ? 'first:rounded-r-md last:rounded-l-md'
                      : 'first:rounded-l-md last:rounded-r-md',
                    selectedTab === tab.label
                      ? '!bg-primary !text-white'
                      : 'bg-transparent text-white/70'
                  )}
                  key={tab.label}
                  value={tab.label}
                >
                  {!isMobile ? tab.icon : null}
                  {tab.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup> */}
            <PerpsTable
              isRTL={isRTL}
              selectedTab={'all'}
              searchTerm={searchTerm}
              setIsOpen={setIsOpen}
              selectedAsset={selectedAsset}
              setSelectedAsset={(asset) => {
                router.push(`/${asset}`)
                setIsOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
        <Separator orientation="vertical" className="hidden md:block !h-full" />
        <div
          className={clsx(
            'hidden md:flex flex-nowrap gap-4 px-2 w-full items-center justify-between text-white text-xs',
            isRTL ? 'flex-row-reverse' : ''
          )}
        >
          {marketData?.map((item, index) => (
            <div key={index} className="flex flex-col flex-wrap justify-center">
              <div className="text-white/70 text-xs">{item.label}</div>
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
        <div
          className={cn(
            'flex flex-1 h-full md:hidden items-center justify-end gap-2',
            isRTL && 'flex-row-reverse'
          )}
        >
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
            <PopoverContent align="end" className={clsx('w-fit h-fit flex flex-col gap-4')}>
              {marketData?.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-1 items-start flex-wrap justify-center"
                >
                  <div className="text-white/70 text-xs text-nowrap">{item.label}</div>
                  <div className={`text-xs text-nowrap ${item.color || 'text-white'}`}>
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
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}

export default Selector
