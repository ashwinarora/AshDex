'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import Image from 'next/image'
import type { WsBook, WsLevel } from '../../utils/hyperliquid/hyperLiquidTypes'
import Filter1 from '../../assets/images/tabler-icon-layout-filled.svg'
import Filter2 from '../../assets/images/tabler-icon-layout-filledAlt.svg'
import Filter3 from '../../assets/images/tabler-icon-layout-filled-mirrored.svg'

import Skeleton from '../common/Skeleton'
import { SkeletonSize } from '../common/Skeleton'
import { IconArrowDown, IconArrowUp, IconChevronDown, IconDotsVertical } from '@tabler/icons-react'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { getCoinName } from '@/utils/utils'
import { RadioGroupItem, RadioGroup } from '../common/RadioGroup'

interface IOrderBookProps {
  selectedAsset: string
  layout?: 'horizontal' | 'vertical'
}

const OrderBook = ({ selectedAsset, layout = 'vertical' }: IOrderBookProps) => {
  const { sdk, allMids } = useHyperliquid()
  const [l2Book, setL2Book] = useState<WsBook>()
  const [isLoading, setIsLoading] = useState(true)
  const [priceChange, setPriceChange] = useState<'up' | 'down' | null>(null)
  const prevPriceRef = useRef<number | null>(null)
  const sellsContainerRef = useRef<HTMLDivElement>(null)
  const buysContainerRef = useRef<HTMLDivElement>(null)
  const [visibleRows, setVisibleRows] = useState<{ sells: number; buys: number }>({
    sells: 10,
    buys: 9
  })
  const [selectedLayoutType, setSelectedLayouttype] = useState<1 | 2 | 3>(1)
  const [selectedPrecision, setSelectedPrecision] = useState<string>('1')
  const [showPrecisionSelector, setShowPrecisionSelector] = useState<boolean>(false)
  const [spread, setSpread] = useState<number>(0.0)
  const [showPriceInUSD, setShowPriceInUSD] = useState<boolean>(false)
  const [showPriceInUSDSelector, setShowPriceInUSDSelector] = useState<boolean>(false)
  // function usePrevious<T>(value: T): T | undefined {
  //   const ref = useRef<T>()
  //   useEffect(() => {
  //     ref.current = value
  //   }, [value])
  //   return ref.current
  // }

  //const prevPrecision = usePrevious(selectedPrecision)

  useEffect(() => {
    if (!sdk || !selectedAsset) return

    const coin = selectedAsset // ✅ must match what you use in subscribe
    const nSigFigs = Number(selectedPrecision)
    const mantissa = null
    const handler = (data: WsBook) => {
      setL2Book(data)
      setIsLoading(false)
    }

    setIsLoading(true)
    sdk.subscriptions.subscribeToL2Book(selectedAsset, handler)
    console.log('SUBSCRIBE ->', { coin, nSigFigs, mantissa })

    // ✅ Cleanup is guaranteed to run BEFORE next effect
    return () => {
      //const prevNSigFigs = Number(prevPrecision ?? selectedPrecision)
      sdk.subscriptions.unsubscribeFromL2Book('BTC')
      console.log('UNSUBSCRIBE ->', { coin, nSigFigs, mantissa })
    }
  }, [sdk, selectedAsset, selectedPrecision])

  const processOrders = (orders: WsLevel[]) => {
    let runningTotal = 0
    return orders.map((order) => {
      runningTotal += Number(order.sz)
      return { ...order, cumulative: runningTotal }
    })
  }

  const [rawBuys, rawSells] = l2Book?.levels ?? [[], []]

  const sells = useMemo(
    () => processOrders(rawSells.slice(0, visibleRows.sells)),
    [rawSells, visibleRows.sells]
  )
  const buys = useMemo(
    () => processOrders(rawBuys.slice(0, visibleRows.buys)),
    [rawBuys, visibleRows.buys]
  )

  useEffect(() => {
    if (!isLoading && sellsContainerRef.current) {
      sellsContainerRef.current.scrollTop = sellsContainerRef.current.scrollHeight
    }
  }, [isLoading])

  const maxSellCumulative = sells[sells.length - 1]?.cumulative ?? 0
  const maxBuyCumulative = buys[buys.length - 1]?.cumulative ?? 0
  const maxCumulative = Math.max(maxSellCumulative, maxBuyCumulative)

  const sellWidths = ['full', '6xl', '5xl', '4xl', '3xl', '2xl', 'xl', 'lg', 'md', 'sm']
  const buyWidths = ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', 'full']

  const renderSkeletonRow = (isSell: boolean, index: number) => {
    const widthClass = isSell ? sellWidths[index] : buyWidths[index]
    return (
      <div className="relative flex justify-between px-4 py-0.5">
        <Skeleton
          className="ml-auto rounded-none"
          size={widthClass as SkeletonSize}
          color={isSell ? 'bg-red/10' : 'bg-green/10'}
        />
      </div>
    )
  }

  useEffect(() => {
    if (allMids[selectedAsset]) {
      const currentPrice = allMids[selectedAsset]
      if (prevPriceRef.current !== null) {
        if (currentPrice > prevPriceRef.current) {
          setPriceChange('up')
        } else if (currentPrice < prevPriceRef.current) {
          setPriceChange('down')
        }
      }
      prevPriceRef.current = currentPrice
    }
  }, [allMids, selectedAsset])

  useEffect(() => {
    const _spread = (Number(sells[0]?.px) - Number(buys[0]?.px)).toFixed(4)

    setSpread(Number(_spread))
    return () => {}
  }, [buys, sells])

  const showTotalColumn = layout === 'vertical'
  //const showMobileHeaders = layout === 'horizontal'
  const handlePrecision = (precision: string) => {
    setSelectedPrecision(precision)
    setShowPrecisionSelector(false)
  }

  // Add resize observer to calculate visible rows
  useEffect(() => {
    if (!sellsContainerRef.current || !buysContainerRef.current) return

    const calculateVisibleRows = () => {
      const rowHeight = 22 // Updated: py-1 (16px) + my-[1px] (2px) = 26px total per row
      const headerHeight = 64 // Reduced from 80 to 64 (more precise measurement)
      const priceDisplayHeight = 32 // Reduced from 40 to 32 (more precise measurement)

      const containerHeight = sellsContainerRef.current?.parentElement?.clientHeight || 0
      const availableHeight = containerHeight - headerHeight - priceDisplayHeight

      // Calculate rows for each section based on layout type
      if (selectedLayoutType === 1) {
        // Calculate total possible rows and ensure even distribution
        const totalRows = Math.floor(availableHeight / rowHeight)
        // Ensure even number of rows for equal distribution
        const rowsPerSection = Math.floor(totalRows / 2)
        setVisibleRows({ sells: rowsPerSection, buys: rowsPerSection })
      } else {
        // Use Math.ceil to ensure we use all available space
        const rows = Math.ceil(availableHeight / rowHeight)
        setVisibleRows({ sells: rows, buys: rows })
      }
    }

    const resizeObserver = new ResizeObserver(calculateVisibleRows)
    resizeObserver.observe(sellsContainerRef.current.parentElement!)

    calculateVisibleRows() // Initial calculation

    return () => resizeObserver.disconnect()
  }, [selectedLayoutType])

  return (
    <div className="flex flex-col w-full h-full text-gray-200 text-sm">
      <div className="flex justify-between items-center px-3 py-2">
        <p className="font-semi-bold text-white text-xs">Order Book</p>
        <div className="flex gap-2 text-white">
          <Image
            className={`${selectedLayoutType === 1 ? 'bg-white/10 ' : 'opacity-50'} rounded-md cursor-pointer p-1 h-6 w-6`}
            onClick={() => setSelectedLayouttype(1)}
            src={Filter1}
            height={12}
            width={12}
            alt=""
          />
          <Image
            className={`${selectedLayoutType === 2 ? 'bg-white/10 ' : 'opacity-50'} rounded-md cursor-pointer p-1 h-6 w-6`}
            onClick={() => setSelectedLayouttype(2)}
            src={Filter2}
            height={12}
            width={12}
            alt=""
          />

          <Image
            className={`${selectedLayoutType === 3 ? 'bg-white/10 ' : 'opacity-50'} rounded-md cursor-pointer p-1 h-6 w-6`}
            onClick={() => setSelectedLayouttype(3)}
            src={Filter3}
            height={12}
            width={12}
            alt=""
          />
        </div>
        <div className="hidden items-center">
          <IconDotsVertical className="w-4 h-4" />
        </div>
      </div>
      <div className="flex justify-between px-3">
        <div className="relative">
          {/* Toggle button only */}
          <div
            onClick={(e) => {
              e.preventDefault()
              setShowPrecisionSelector((prev) => !prev)
            }}
            className="flex items-center gap-1 hover:bg-white/10 px-2 py-0.5 rounded-md text-white/50 hover:text-white cursor-pointer"
          >
            <p className="text-white text-xs">{selectedPrecision}</p>
            <IconChevronDown className="w-4 h-4" />
          </div>

          {/* Dropdown */}
          {showPrecisionSelector && (
            <div
              className="top-6 left-0 z-50 absolute flex flex-col bg-secondary shadow-xl p-1 border border-white/10 rounded-md w-max min-w-[4rem]"
              onClick={(e) => e.stopPropagation()} // prevent bubbling
            >
              <RadioGroup
                name="precision"
                value={selectedPrecision}
                onChange={(val) => {
                  handlePrecision(val)
                  setShowPrecisionSelector(false) // close AFTER change
                }}
                className="flex flex-col text-xs"
              >
                <RadioGroupItem value="1" label="0.1" />
                <RadioGroupItem value="2" label="0.01" />
                <RadioGroupItem value="3" label="0.001" />
              </RadioGroup>
            </div>
          )}
        </div>
        <div className="relative">
          {/* Toggle button */}
          <div
            onClick={() => setShowPriceInUSDSelector((prev) => !prev)}
            className="flex items-center gap-1 hover:bg-white/10 p-0.5 px-2 rounded-md text-white/50 hover:text-white text-center align-middle cursor-pointer"
          >
            <p className="text-white text-xs">
              {showPriceInUSD ? 'USD' : getCoinName(selectedAsset)}
            </p>
            <IconChevronDown className="w-4 h-4" />
          </div>

          {/* Dropdown */}
          {showPriceInUSDSelector && (
            <div
              className="top-6 -left-5 z-50 absolute bg-secondary shadow-lg py-1 border border-white/10 rounded-md w-max min-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <RadioGroup
                name="priceType"
                value={showPriceInUSD ? 'usd' : 'coin'}
                onChange={(val) => {
                  setShowPriceInUSD(val === 'usd')
                  setShowPriceInUSDSelector(false)
                }}
                className="flex flex-col gap-1 px-1 text-xs"
              >
                <RadioGroupItem value="usd" label="USD" />
                <RadioGroupItem value="coin" label={getCoinName(selectedAsset)} />
              </RadioGroup>
            </div>
          )}
        </div>
      </div>

      {showTotalColumn && (
        <div className="flex justify-between my-1 px-3 py-1 w-full font-medium text-[#E8E0F1]">
          <p className="font-medium text-xs text-left">Price </p>
          <p className="font-medium text-xs">
            Amount ({showPriceInUSD ? 'USD' : getCoinName(selectedAsset)})
          </p>
          <p className="font-medium text-xs text-right">
            Total ({showPriceInUSD ? 'USD' : getCoinName(selectedAsset)})
          </p>
        </div>
      )}

      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Top - Sells */}
        <div
          ref={sellsContainerRef}
          className={`flex-col no-scrollbar h-full order-2 ${selectedLayoutType === 2 ? 'hidden' : 'flex h-[50%] order-1'}`}
        >
          {isLoading
            ? Array(visibleRows.sells)
                .fill(0)
                .map((_, i) => <div key={i}>{renderSkeletonRow(true, i)}</div>)
            : (selectedLayoutType !== 3 ? [...sells].reverse() : sells).map((order, index) => {
                const pct = maxCumulative ? (order.cumulative / maxCumulative) * 100 : 0
                return (
                  <div
                    key={`sell-${index}`}
                    className="justify-between grid grid-cols-7 my-[1px] px-3 py-1"
                    style={{
                      background: `linear-gradient(to left, rgba(239,68,68,0.1) ${pct}%, transparent ${pct}%)`
                    }}
                  >
                    <p className="flex col-span-2 font-medium text-red text-xs">{order.px}</p>
                    <p className="flex col-span-2 opacity-90 ml-auto text-white text-xs">
                      {showPriceInUSD
                        ? new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(Number(order.px) * Number(order.sz))
                        : order.sz}
                    </p>
                    {showTotalColumn && (
                      <p className="flex col-span-3 opacity-90 ml-auto text-white text-xs">
                        {showPriceInUSD ? (
                          <>
                            {new Intl.NumberFormat('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(order.cumulative * Number(order.px))}
                          </>
                        ) : (
                          <>{order.cumulative.toFixed(4)}</>
                        )}
                      </p>
                    )}
                  </div>
                )
              })}
        </div>

        {/* Middle - Fixed Price */}
        {allMids[selectedAsset] && (
          <div
            className={`z-10 bg-white/5 py-2 my-0.5 pointer-events-none ${selectedLayoutType === 1 ? 'order-2' : 'order-1'}`}
          >
            <div className="flex justify-between items-center px-3 rounded-md pointer-events-auto">
              <p
                className={`text-sm font-semibold font-proxima-nova items-center flex ${
                  priceChange === 'up'
                    ? 'text-green'
                    : priceChange === 'down'
                      ? 'text-red'
                      : 'text-white'
                }`}
              >
                ${allMids[selectedAsset]}
                {priceChange === 'up' ? (
                  <IconArrowUp className="inline w-4 h-4" />
                ) : (
                  <IconArrowDown className="inline w-4 h-4" />
                )}
              </p>
              <p>{spread}</p>
              <p className="text-right">{((spread / allMids[selectedAsset]) * 100).toFixed(3)}%</p>
            </div>
          </div>
        )}

        {/* Bottom - Buys */}
        <div
          ref={buysContainerRef}
          className={`flex-col no-scrollbar h-full order-2 ${selectedLayoutType === 3 ? 'hidden' : 'flex h-[50%] order-3'}`}
        >
          {isLoading
            ? Array(visibleRows.buys)
                .fill(0)
                .map((_, i) => <div key={i}>{renderSkeletonRow(false, i)}</div>)
            : buys.map((order, index) => {
                const pct = maxCumulative ? (order.cumulative / maxCumulative) * 100 : 0
                return (
                  <div
                    key={`buy-${index}`}
                    className="justify-between grid grid-cols-7 my-[1px] px-3 py-1"
                    style={{
                      background: `linear-gradient(to left, rgba(34,197,94,0.1) ${pct}%, transparent ${pct}%)`
                    }}
                  >
                    <p className="flex col-span-2 font-medium text-green text-xs">{order.px}</p>
                    <p className="flex col-span-2 opacity-90 ml-auto text-white text-xs">
                      {showPriceInUSD
                        ? new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(Number(order.px) * Number(order.sz))
                        : order.sz}
                    </p>
                    {showTotalColumn && (
                      <p className="flex col-span-3 opacity-90 ml-auto text-white text-xs">
                        {showPriceInUSD ? (
                          <>
                            {new Intl.NumberFormat('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(order.cumulative * Number(order.px))}
                          </>
                        ) : (
                          <>{order.cumulative.toFixed(4)}</>
                        )}
                      </p>
                    )}
                  </div>
                )
              })}
        </div>
      </div>
    </div>
  )
}

export default OrderBook
