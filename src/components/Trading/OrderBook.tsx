'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import Image from 'next/image'
import Filter1 from '../../assets/images/tabler-icon-layout-filled.svg'
import Filter2 from '../../assets/images/tabler-icon-layout-filledAlt.svg'
import Filter3 from '../../assets/images/tabler-icon-layout-filled-mirrored.svg'

import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { generatePrecisionLabels } from '@/utils/utils'
import { cn } from '@/lib/utils'
import ReactiveText from '../common/ReactiveText'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Skeleton } from '../ui/skeleton'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { EventL2BookParameters, Book, BookLevel } from '@nktkas/hyperliquid'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { useScreenSize } from '@/hooks/useScreenSize'
import { useShallow } from 'zustand/react/shallow'
import clsx from 'clsx'
import { useTranslate } from '@tolgee/react'

interface IOrderBookProps {
  selectedAsset: string
  layout?: 'horizontal' | 'vertical'
  isRTL: boolean
}

const OrderBook = ({ selectedAsset, isRTL }: IOrderBookProps) => {
  const { sdkSubscriptionClient, allMids } = useHyperliquidStore(
    useShallow((state) => ({
      sdkSubscriptionClient: state.sdkSubscriptionClient,
      allMids: state.allMids
    }))
  )
  const [l2Book, setL2Book] = useState<Book>()
  const { isMobile, isTablet } = useScreenSize()
  const { t } = useTranslate()
  const [isLoading, setIsLoading] = useState(true)
  const [priceChange, setPriceChange] = useState<'up' | 'down' | null>(null)
  const prevPriceRef = useRef<number | null>(null)
  const visibleRows = {
    sells: 9,
    buys: 9
  }
  const [selectedLayoutType, setSelectedLayouttype] = useState<number>(1)
  const [selectedPrecision, setSelectedPrecision] = useState<{
    value: number | null
    label: string
  }>({
    value: null,
    label: '--'
  })
  const [spread, setSpread] = useState<number>(0.0)
  const [showPriceInUSD, setShowPriceInUSD] = useState<boolean>(false)
  const { spotKeyToName } = useSpotMeta()
  const subRef = useRef<{ unsubscribe: () => void } | null>(null)

  useEffect(() => {
    if (!sdkSubscriptionClient || !selectedAsset) return

    let mountedRef = true
    // Use refs to track subscription state across async operations

    const nSigFigs = selectedPrecision.value === null ? null : Number(selectedPrecision.value)
    let mantissa = null
    const handler = (data: Book) => {
      if (mountedRef) {
        setL2Book(data)
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    if (nSigFigs === 5) {
      mantissa = 2
    }

    // Create a subscription controller
    const abortController = new AbortController()

    // Use an async IIFE to create subscription
    ;(async () => {
      try {
        // Don't create subscription if component unmounted
        if (!mountedRef) return

        const newSub = await sdkSubscriptionClient.l2Book(
          {
            coin: selectedAsset,
            nSigFigs: nSigFigs
              ? (Math.min(nSigFigs, 5) as EventL2BookParameters['nSigFigs'])
              : null,
            mantissa: mantissa as EventL2BookParameters['mantissa']
          },
          handler
        )

        // Check if the component is still mounted before storing subscription
        if (!mountedRef || abortController.signal.aborted) {
          newSub.unsubscribe()
          return
        }

        // Store the subscription for later cleanup
        subRef.current = newSub
      } catch (error) {
        console.error(`[OrderBook] Error creating subscription:`, error)
      }
    })()

    // Cleanup function to properly handle subscription lifecycle
    return () => {
      mountedRef = false
      abortController.abort()

      if (subRef.current) {
        subRef.current.unsubscribe()
        subRef.current = null
      }
    }
  }, [sdkSubscriptionClient, selectedAsset, selectedPrecision.value])

  // Reset precision when asset changes
  useEffect(() => {
    setSelectedPrecision({
      value: null,
      label: '--'
    })
  }, [selectedAsset])

  // Initialize precision label when component mounts or mid price changes
  useEffect(() => {
    if (!selectedAsset || !allMids[selectedAsset]) return

    // Only update if not already set
    if (selectedPrecision.value === null) {
      const precisionOptions = generatePrecisionLabels(Number(allMids[selectedAsset]) || 0)
      // Select a default precision option
      const defaultOption = precisionOptions[precisionOptions.length - 1] // Choose second option if available, otherwise first
      if (defaultOption) {
        setSelectedPrecision({
          value: defaultOption.value,
          label: defaultOption.label
        })
      }
    }
  }, [selectedAsset, allMids, selectedPrecision.value])

  const processOrders = (orders: BookLevel[]) => {
    if (!orders || orders.length === 0) {
      return []
    }

    const maxDecimalPlaces = Math.max(
      ...orders.map((order) => {
        const parts = order.px.split('.')
        return parts.length > 1 ? parts[1].length : 0
      })
    )

    let runningTotal = 0
    return orders.map((order) => {
      runningTotal += Number(order.sz)
      return {
        ...order,
        px: Number(order.px).toFixed(maxDecimalPlaces),
        cumulative: runningTotal
      }
    })
  }

  const [rawBuys, rawSells] = l2Book?.levels ?? [[], []]

  const barData = useMemo(() => {
    if (selectedLayoutType === 1) {
      return {
        sells: processOrders(rawSells.slice(0, 9)),
        buys: processOrders(rawBuys.slice(0, 9))
      }
    } else if (selectedLayoutType === 2) {
      return { sells: [], buys: processOrders(rawBuys.slice(0, 18)) }
    } else if (selectedLayoutType === 3) {
      return { sells: processOrders(rawSells.slice(0, 18)), buys: [] }
    }
    return { sells: [], buys: [] }
  }, [rawBuys, rawSells, selectedLayoutType])

  const maxSellCumulative = barData?.sells[0]?.cumulative ?? 0
  const maxBuyCumulative = barData?.buys[barData.buys.length - 1]?.cumulative ?? 0
  const maxCumulative = Math.max(maxSellCumulative, maxBuyCumulative)

  useEffect(() => {
    if (allMids[selectedAsset]) {
      const currentPrice = allMids[selectedAsset]
      if (prevPriceRef.current !== null) {
        if (Number(currentPrice) > Number(prevPriceRef.current)) {
          setPriceChange('up')
        } else if (Number(currentPrice) < Number(prevPriceRef.current)) {
          setPriceChange('down')
        }
      }
      prevPriceRef.current = Number(currentPrice)
    }
  }, [allMids, selectedAsset])

  useEffect(() => {
    const _spread = (Number(rawSells[0]?.px || 0) - Number(rawBuys[0]?.px || 0)).toFixed(8)
    setSpread(Number(_spread))
    return () => {}
  }, [rawBuys, rawSells])

  const handlePrecision = (precision: number | null, label: string) => {
    setSelectedPrecision({ value: precision, label })
  }

  if (isMobile || isTablet) {
    if (isLoading) {
      return (
        <div className="flex flex-col p-1 gap-1 bg-secondary rounded-md items-center justify-start w-full h-96">
          <div className="flex items-center justify-between w-full h-12 px-1">
            <Skeleton className="w-28 h-10" />
            <Skeleton className="w-28 h-10" />
          </div>
          <div className="flex h-full w-full flex-1 flex-row gap-1 items-center justify-between">
            <div className="flex flex-col gap-1 w-full flex-1 h-full">
              {Array(visibleRows.sells)
                .fill(0)
                .map((_, index) => (
                  <Skeleton
                    className="px-2 py-1 w-full rounded-none last:rounded-bl-md shrink-0 !h-6 flex-1 bg-red/20"
                    key={index}
                  />
                ))}
            </div>
            <div className="flex flex-col gap-1 w-full flex-1 h-full">
              {Array(visibleRows.buys)
                .fill(0)
                .map((_, index) => (
                  <Skeleton
                    className="px-2 py-1 w-full rounded-none last:rounded-br-md shrink-0 !h-6 flex-1 bg-green/20"
                    key={index}
                  />
                ))}
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="flex flex-col p-1 gap-1 bg-secondary rounded-md items-center justify-start w-full h-96">
        <div className="flex items-center justify-between w-full h-12 px-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size={'sm'}
                className="text-xs w-20 flex items-center justify-start"
              >
                <p className="text-xs flex-1 w-full">{selectedPrecision.label}</p>
                <IconChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-20 flex flex-col gap-1" align="end">
              {/* <DropdownMenuItem onClick={() => setIsInputUsd(true)}>
              <p className="text-xs w-10 text-center">USD</p>
            </DropdownMenuItem> */}
              {generatePrecisionLabels(Number(allMids[selectedAsset]) || 0).map((level, index) => (
                <DropdownMenuItem
                  className={cn(
                    selectedPrecision.label === level.label
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-transparent text-white/50'
                  )}
                  key={index}
                  onClick={() => handlePrecision(level.value, level.label)}
                >
                  <p className="text-xs w-full text-center">{level.label}</p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size={'sm'}
                className="text-xs w-20 flex items-center justify-start"
              >
                <p className="text-xs flex-1 w-full">
                  {showPriceInUSD ? 'USD' : (spotKeyToName.get(selectedAsset) ?? selectedAsset)}
                </p>
                <IconChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-20 flex flex-col gap-1" align="end">
              <DropdownMenuItem
                onClick={() => {
                  setShowPriceInUSD(true)
                }}
              >
                <p className="text-xs w-full text-center">USD</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setShowPriceInUSD(false)
                }}
              >
                <p className="text-xs w-full text-center">
                  {spotKeyToName.get(selectedAsset) ?? selectedAsset}
                </p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex h-full w-full flex-1 flex-row gap-1 items-center justify-between">
          <div className="flex flex-col gap-1 w-full flex-1 h-full">
            {barData?.buys.map((buy, index) => (
              <div className="relative h-full w-full py-1 px-2 flex items-center" key={index}>
                <div className="flex items-center z-10 w-full justify-between text-sm text-white">
                  {/* <p className="font-medium text-xs">{buy.sz}</p> */}
                  {showPriceInUSD ? (
                    <ReactiveText
                      precision={0}
                      type="number"
                      className="text-start text-xs flex-1"
                      value={Number(buy.px) * Number(buy.cumulative)}
                    />
                  ) : (
                    <ReactiveText
                      precision={4}
                      type="number"
                      className="text-start text-xs flex-1"
                      value={Number(buy.cumulative)}
                    />
                  )}
                  <p className="font-medium text-xs flex-1 text-end text-green">{buy.px}</p>
                </div>
                <div className="absolute last:rounded-b-md md:last:rounded-b-none flex items-center justify-end top-0 z-0 left-0 w-full h-full">
                  <div
                    className={cn(
                      'bg-green/20 h-full',
                      index === barData?.buys.length - 1 ? 'rounded-bl-md md:rounded-bl-none' : ''
                    )}
                    style={{ width: `${(buy.cumulative / maxCumulative) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1 w-full flex-1 h-full">
            {barData?.sells
              .sort((a, b) => Number(a.px) - Number(b.px))
              .map((sell, index) => (
                <div className="relative  h-full w-full py-1 px-2 flex items-center" key={index}>
                  <div className="flex items-center z-10 w-full justify-between text-sm text-white">
                    <p className="font-medium text-xs text-start flex-1 text-red">{sell.px}</p>
                    {/* <p className="font-medium text-xs">{sell.sz}</p> */}
                    {showPriceInUSD ? (
                      <ReactiveText
                        precision={3}
                        type="number"
                        className="text-end flex-1 text-xs"
                        value={Number(sell.px) * Number(sell.cumulative)}
                      />
                    ) : (
                      <ReactiveText
                        precision={4}
                        type="number"
                        className="text-end flex-1 text-xs"
                        value={Number(sell.cumulative)}
                      />
                    )}
                  </div>
                  <div className="absolute last:rounded-br-md md:last:rounded-br-none flex items-center justify-start top-0 z-0 left-0 w-full h-full">
                    <div
                      className="bg-red/20 h-full"
                      style={{ width: `${(sell.cumulative / maxCumulative) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-secondary rounded-md pt-2 gap-2 w-full h-full text-white/50">
      <div
        className={clsx('flex justify-between items-center px-2', isRTL ? 'flex-row-reverse' : '')}
      >
        <h1 className="text-white text-sm font-semibold">{t('Order Book')}</h1>
        <ToggleGroup
          size={'sm'}
          type="single"
          className="bg-white/5"
          value={selectedLayoutType.toString()}
          onValueChange={(value) => value !== '' && setSelectedLayouttype(Number(value))}
        >
          {[1, 2, 3].map((item) => (
            <ToggleGroupItem
              value={item.toString()}
              key={item}
              className={cn(
                'px-4 py-1 first:rounded-l-md last:rounded-r-md cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
                selectedLayoutType === item
                  ? 'bg-primary text-white'
                  : 'bg-transparent text-white/50'
              )}
            >
              <Image
                src={item === 1 ? Filter1 : item === 2 ? Filter2 : Filter3}
                height={12}
                width={12}
                className="size-4"
                alt=""
              />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div
        className={clsx(
          'flex items-center gap-2 px-2 justify-between',
          isRTL ? 'flex-row-reverse' : ''
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size={'sm'}
              className="text-xs w-20 flex items-center justify-start"
            >
              <p className="text-xs flex-1 w-full">{selectedPrecision.label}</p>
              <IconChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-20 flex flex-col gap-1" align="end">
            {/* <DropdownMenuItem onClick={() => setIsInputUsd(true)}>
              <p className="text-xs w-10 text-center">USD</p>
            </DropdownMenuItem> */}
            {generatePrecisionLabels(Number(allMids[selectedAsset]) || 0).map((level, index) => (
              <DropdownMenuItem
                className={cn(
                  selectedPrecision.label === level.label
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-transparent text-white/50'
                )}
                key={index}
                onClick={() => handlePrecision(level.value, level.label)}
              >
                <p className="text-xs w-full text-center">{level.label}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size={'sm'}
              className="text-xs w-20 flex items-center justify-start"
            >
              <p className="text-xs flex-1 w-full">
                {showPriceInUSD ? 'USD' : (spotKeyToName.get(selectedAsset) ?? selectedAsset)}
              </p>
              <IconChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-20 flex flex-col gap-1" align="end">
            <DropdownMenuItem
              onClick={() => {
                setShowPriceInUSD(true)
              }}
            >
              <p className="text-xs w-full text-center">USD</p>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setShowPriceInUSD(false)
              }}
            >
              <p className="text-xs w-full text-center">
                {spotKeyToName.get(selectedAsset) ?? selectedAsset}
              </p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator orientation="horizontal" />
      <div
        className={clsx('flex items-center justify-between px-2', isRTL ? 'flex-row-reverse' : '')}
      >
        <p className="font-medium text-xs text-start">{t('Price')}</p>
        <p className="font-medium text-xs text-center flex-1">
          {t('Amount')} (
          {showPriceInUSD ? 'USD' : (spotKeyToName.get(selectedAsset) ?? selectedAsset)})
        </p>
        <p className="font-medium text-xs text-end">
          {t('Total')} (
          {showPriceInUSD ? 'USD' : (spotKeyToName.get(selectedAsset) ?? selectedAsset)})
        </p>
      </div>
      <Separator orientation="horizontal" className="bg-white/5 -mb-1" />
      {isLoading ? (
        <div className="flex p-2 h-full w-full flex-1 flex-col gap-1 items-center justify-between">
          {Array(visibleRows.sells)
            .fill(0)
            .map((_, index) => (
              <Skeleton
                className="px-2 py-1 w-full rounded-none h-full flex-1 bg-red/20"
                key={index}
              />
            ))}
          <Skeleton className="px-2 py-1 w-full rounded-none h-full flex-1 bg-accent" />
          {Array(visibleRows.buys)
            .fill(0)
            .map((_, index) => (
              <Skeleton
                className="px-2 py-1 w-full rounded-none h-full flex-1 bg-green/20"
                key={index}
              />
            ))}
        </div>
      ) : (
        <div className="w-full h-full rounded-b-md overflow-hidden flex flex-col gap-1 items-center justify-between">
          {barData?.sells
            .sort((a, b) => Number(b.px) - Number(a.px))
            .map((sell, index) => (
              <div
                className={clsx('relative h-full w-full py-1 px-2 flex items-center')}
                key={index}
              >
                <div
                  className={clsx(
                    'flex items-center z-10 w-full justify-between text-sm text-white',
                    isRTL ? 'flex-row-reverse' : ''
                  )}
                >
                  <p
                    className={clsx(
                      'font-medium text-xs flex-1 text-red',
                      isRTL ? 'text-end' : 'text-start'
                    )}
                  >
                    {sell.px}
                  </p>
                  <p className="font-medium text-xs">{sell.sz}</p>
                  {showPriceInUSD ? (
                    <ReactiveText
                      precision={3}
                      type="number"
                      className={clsx('flex-1 text-xs', isRTL ? 'text-start' : 'text-end')}
                      value={Number(sell.px) * Number(sell.cumulative)}
                    />
                  ) : (
                    <ReactiveText
                      precision={4}
                      type="number"
                      className={clsx('flex-1 text-xs', isRTL ? 'text-start' : 'text-end')}
                      value={Number(sell.cumulative)}
                    />
                  )}
                </div>
                <div className="absolute flex items-center justify-end top-0 z-0 left-0 w-full h-full">
                  <div
                    className="bg-red/20 h-full"
                    style={{ width: `${(sell.cumulative / maxCumulative) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          <div
            className={clsx(
              'flex items-center justify-between px-2 w-full text-xs h-10 bg-accent py-3 z-10',
              isRTL && 'flex-row-reverse'
            )}
          >
            <p
              className={cn(
                'text-sm flex-1 font-semibold flex items-center gap-2',
                isRTL ? 'flex-row-reverse' : '',
                priceChange === 'up'
                  ? 'text-green'
                  : priceChange === 'down'
                    ? 'text-red'
                    : 'text-white'
              )}
            >
              ${allMids[selectedAsset]}
              {priceChange === 'up' ? (
                <IconChevronDown className="size-4" />
              ) : priceChange === 'down' ? (
                <IconChevronUp className="size-4" />
              ) : (
                ''
              )}
            </p>
            <p className="">{isNaN(spread) ? '-' : spread}</p>
            <p className={clsx('flex-1', isRTL ? 'text-start' : 'text-end')}>
              {isNaN(spread) || !allMids[selectedAsset]
                ? '-'
                : ((Number(spread) / Number(allMids[selectedAsset])) * 100).toFixed(3)}
              %
            </p>
          </div>
          {barData?.buys.map((buy, index) => (
            <div className={clsx('relative h-full w-full py-1 px-2 flex items-center')} key={index}>
              <div
                className={clsx(
                  'flex items-center z-10 w-full justify-between text-sm text-white',
                  isRTL ? 'flex-row-reverse' : ''
                )}
              >
                <p
                  className={clsx(
                    'font-medium text-xs flex-1 text-green',
                    isRTL ? 'text-end' : 'text-start'
                  )}
                >
                  {buy.px}
                </p>
                <p className="font-medium text-xs">{buy.sz}</p>
                {showPriceInUSD ? (
                  <ReactiveText
                    precision={0}
                    type="number"
                    className={clsx('flex-1 text-xs', isRTL ? 'text-start' : 'text-end')}
                    value={Number(buy.px) * Number(buy.cumulative)}
                  />
                ) : (
                  <ReactiveText
                    precision={4}
                    type="number"
                    className={clsx('flex-1 text-xs', isRTL ? 'text-start' : 'text-end')}
                    value={Number(buy.cumulative)}
                  />
                )}
              </div>
              <div
                className={cn(
                  'absolute last:rounded-b-md flex items-center justify-end top-0 z-0 w-full h-full left-0'
                )}
              >
                <div
                  className={cn(
                    'bg-green/20 h-full',
                    index === barData?.buys.length - 1 ? 'rounded-b-md' : ''
                  )}
                  style={{ width: `${(buy.cumulative / maxCumulative) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrderBook
