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
  const [selectedLayoutType, setSelectedLayouttype] = useState<1 | 2 | 3>(1)
  const [selectedPrecision, setSelectedPrecision] = useState<number>(1)
  const [showPrecisionSelector, setShowPrecisionSelector] = useState<boolean>(false)
  useEffect(() => {
    if (!sdk || !selectedAsset) return

    setIsLoading(true)
    sdk.subscriptions.subscribeToL2Book(selectedAsset, (data: WsBook) => {
      setL2Book(data)
      setIsLoading(false)
    })
    return () => {
      sdk.subscriptions.unsubscribeFromL2Book(selectedAsset)
    }
  }, [selectedAsset, sdk])

  const processOrders = (orders: WsLevel[]) => {
    let runningTotal = 0
    return orders.map((order) => {
      runningTotal += Number(order.sz)
      return { ...order, cumulative: runningTotal }
    })
  }

  const [rawBuys, rawSells] = l2Book?.levels ?? [[], []]

  const sells = useMemo(
    () => processOrders(rawSells.slice(0, selectedLayoutType === 1 ? 10 : 21)),
    [rawSells, selectedLayoutType]
  )
  const buys = useMemo(
    () => processOrders(rawBuys.slice(0, selectedLayoutType === 1 ? 11 : 21)),
    [rawBuys, selectedLayoutType]
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
      <div className="relative flex justify-between px-4 py-0.5 ">
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

  const showTotalColumn = layout === 'vertical'
  //const showMobileHeaders = layout === 'horizontal'

  const handlePrecision = (precision: number) => {
    setSelectedPrecision(precision)
    setShowPrecisionSelector(false)
  }
  return (
    <div className="flex flex-col w-full h-full text-sm text-gray-200">
      <div className="flex justify-between px-4 py-2">
        <p className="text-xs text-white font-semi-bold">Order Book</p>
        <div className="flex items-center">
          <IconDotsVertical className="w-4 h-4" />
        </div>
      </div>
      <div className="flex justify-between px-4">
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
        <div
          onClick={() => setShowPrecisionSelector(!showPrecisionSelector)}
          className="relative flex items-center gap-1 p-0.5 px-2 text-center align-middle rounded-md cursor-pointer hover:bg-white/10 text-white/50 hover:text-white"
        >
          <p>{selectedPrecision}</p>
          <IconChevronDown className="w-4 h-4" />
          {showPrecisionSelector && (
            <div className="absolute left-0 z-50 w-full border rounded-md border-white/5 top-8 bg-secondary overflow-clip">
              <ol className="flex flex-col gap-1 ">
                <li
                  onClick={() => handlePrecision(1)}
                  className="w-full hover:bg-white/5 text-white/50 hover:text-white"
                >
                  1
                </li>
                <li
                  onClick={() => handlePrecision(2)}
                  className="w-full hover:bg-white/5 text-white/50 hover:text-white"
                >
                  2
                </li>
                <li
                  onClick={() => handlePrecision(3)}
                  className="w-full hover:bg-white/5 text-white/50 hover:text-white"
                >
                  3
                </li>
                <li
                  onClick={() => handlePrecision(4)}
                  className="w-full hover:bg-white/5 text-white/50 hover:text-white"
                >
                  4
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
      {/* <div className="flex justify-between px-3 pt-2 my-1 text-gray-300 border-t border-white/10">
        <div className="flex items-center">
          <Image
            src={Filter1}
            alt="Filter1"
            style={{ width: 20, height: 'auto' }}
            className="w-5 h-5 mx-1"
          />
          <Image
            src={Filter2}
            alt="Filter2"
            style={{ width: 20, height: 'auto' }}
            className="w-5 h-5 mx-1"
          />
          <Image
            src={Filter3}
            alt="Filter3"
            style={{ width: 20, height: 'auto' }}
            className="w-5 h-5 mx-1"
          />
        </div>
        <select className="text-[#8B8BA0] text-xs font-medium p-2 rounded-lg">
          <option value="0.01">0.01</option>
          <option value="0.1">0.1</option>
          <option value="1">1</option>
          <option value="10">10</option>
          <option value="100">100</option>
        </select>
      </div> */}

      {showTotalColumn && (
        <div className="flex w-full justify-between text-[#E8E0F1] font-medium px-4 py-1 my-1">
          <span className="text-xs font-medium">Price (USDC)</span>
          <span className="text-xs font-medium">Amount (BTC)</span>
          <span className="text-xs font-medium">Total</span>
        </div>
      )}

      <div className="flex flex-col flex-1 h-full overflow-clip ">
        {/* Top - Sells */}
        <div
          ref={sellsContainerRef}
          className={`flex-col no-scrollbar h-full order-2 ${selectedLayoutType === 2 ? 'hidden' : 'flex h-[50%] order-1'}`}
        >
          {isLoading
            ? Array(10)
                .fill(0)
                .map((_, i) => <div key={i}>{renderSkeletonRow(true, i)}</div>)
            : (selectedLayoutType !== 3 ? [...sells].reverse() : sells).map((order, index) => {
                const pct = maxCumulative ? (order.cumulative / maxCumulative) * 100 : 0
                return (
                  <div
                    key={`sell-${index}`}
                    className="relative flex justify-between px-3 py-1 m-[1px]"
                    style={{
                      background: `linear-gradient(to left, rgba(239,68,68,0.1) ${pct}%, transparent ${pct}%)`
                    }}
                  >
                    <span className="text-xs font-medium text-red">{order.px}</span>
                    <span className="text-xs text-white opacity-90">{order.sz}</span>
                    {showTotalColumn && (
                      <span className="text-xs text-white opacity-90">
                        {order.cumulative.toFixed(2)}
                      </span>
                    )}
                  </div>
                )
              })}
        </div>

        {/* Middle - Fixed Price */}
        {allMids[selectedAsset] && (
          <div
            className={`z-10 pointer-events-none ${selectedLayoutType === 1 ? 'order-2' : 'order-1'}`}
          >
            <div className="flex items-center justify-between px-3 rounded-md pointer-events-auto">
              <p
                className={`text-lg font-semibold font-proxima-nova ${
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
            </div>
          </div>
        )}

        {/* Bottom - Buys */}
        <div
          className={`    flex-col no-scrollbar h-full order-2 ${selectedLayoutType === 3 ? 'hidden' : 'flex h-[50%] order-3'}`}
        >
          {isLoading
            ? Array(10)
                .fill(0)
                .map((_, i) => <div key={i}>{renderSkeletonRow(false, i)}</div>)
            : buys.map((order, index) => {
                const pct = maxCumulative ? (order.cumulative / maxCumulative) * 100 : 0
                return (
                  <div
                    key={`buy-${index}`}
                    className="relative flex justify-between px-3 py-1 m-[1px]"
                    style={{
                      background: `linear-gradient(to left, rgba(34,197,94,0.1) ${pct}%, transparent ${pct}%)`
                    }}
                  >
                    <span className="text-xs font-medium text-green">{order.px}</span>
                    <span className="text-xs text-white opacity-90">{order.sz}</span>
                    {showTotalColumn && (
                      <span className="text-xs text-white opacity-90">
                        {order.cumulative.toFixed(2)}
                      </span>
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
