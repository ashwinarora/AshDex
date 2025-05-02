'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import Image from 'next/image'
import { useHyperLiquid } from '../../context/HyperLiquid'
import type { WsBook, WsLevel } from '../../utils/hyperliquid/hyperLiquidTypes'
import ThreeDot from '../../assets/images/three_dot.svg'
// import Filter1 from '../../assets/images/filter_1.svg'
// import Filter2 from '../../assets/images/filter_2.svg'
// import Filter3 from '../../assets/images/filter_3.svg'
import Skeleton from '../common/Skeleton'
import { SkeletonSize } from '../common/Skeleton'
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react'

interface IOrderBookProps {
  selectedAsset: string
  layout?: 'horizontal' | 'vertical'
}

const OrderBook = ({ selectedAsset, layout = 'vertical' }: IOrderBookProps) => {
  const { sdk, isSdkConnected, allMids } = useHyperLiquid()
  const [l2Book, setL2Book] = useState<WsBook>()
  const [isLoading, setIsLoading] = useState(true)
  const [priceChange, setPriceChange] = useState<'up' | 'down' | null>(null)
  const prevPriceRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isSdkConnected || !selectedAsset) return

    setIsLoading(true)
    sdk.subscriptions.subscribeToL2Book(selectedAsset, (data: WsBook) => {
      setL2Book(data)
      setIsLoading(false)
    })
    return () => {
      sdk.subscriptions.unsubscribeFromL2Book(selectedAsset)
    }
  }, [selectedAsset, isSdkConnected, sdk])

  const processOrders = (orders: WsLevel[]) => {
    let runningTotal = 0
    return orders.map((order) => {
      runningTotal += Number(order.sz)
      return { ...order, cumulative: runningTotal }
    })
  }

  const [rawBuys, rawSells] = l2Book?.levels ?? [[], []]

  const sells = useMemo(() => processOrders(rawSells.slice(0, 25)), [rawSells])
  const buys = useMemo(() => processOrders(rawBuys.slice(0, 25)), [rawBuys])

  // const bestAsk = sells.length ? sells[0].px : 0
  // const bestBid = buys.length ? buys[0].px : 0
  // const spread = bestAsk && bestBid ? Number(bestAsk) - Number(bestBid) : 0
  // const spreadPercent = bestAsk ? (spread / Number(bestAsk)) * 100 : 0

  const maxSellCumulative = sells[sells.length - 1]?.cumulative ?? 0
  const maxBuyCumulative = buys[buys.length - 1]?.cumulative ?? 0
  const maxCumulative = Math.max(maxSellCumulative, maxBuyCumulative)

  const sellWidths = ['full', '6xl', '5xl', '4xl', '3xl', '2xl', 'xl', 'lg', 'md', 'sm']
  const buyWidths = ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', 'full']

  const renderSkeletonRow = (isSell: boolean, index: number) => {
    const widthClass = isSell ? sellWidths[index] : buyWidths[index]
    return (
      <div className="relative flex justify-between py-1 px-4">
        <Skeleton
          size={widthClass as SkeletonSize}
          color={isSell ? 'bg-red-500/20' : 'bg-green-500/20'}
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

  return (
    <div className="w-full text-gray-200 text-sm h-full flex flex-col">
      <div className="flex px-4 py-2 justify-between">
        <p className="text-lg text-white font-semi-bold ">Order Book</p>
        <div className="flex items-center">
          <Image src={ThreeDot} alt="" width={20} height={20} className="w-5 h-5" />
        </div>
      </div>
      {/* <div className="flex justify-between text-gray-300 pt-2 px-3 border-t border-white/10 my-1">
        <div className="flex items-center">
          <Image src={Filter1} alt="" className="w-5 h-5 mx-1" />
          <Image src={Filter2} alt="" className="w-5 h-5 mx-1" />
          <Image src={Filter3} alt="" className="w-5 h-5 mx-1" />
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
        <div className="flex w-full justify-between text-[#E8E0F1] font-medium px-4 py-3 my-1">
          <span className="text-xs font-medium">Price (USDC)</span>
          <span className="text-xs font-medium">Amount (BTC)</span>
          <span className="text-xs font-medium">Total</span>
        </div>
      )}

      <div className="overflow-hidden h-full flex flex-col">
        {/* Top - Sells */}
        <div className="overflow-y-auto flex-col no-scrollbar h-[50%]">
          {isLoading
            ? Array(10)
                .fill(0)
                .map((_, i) => <div key={i}>{renderSkeletonRow(true, i)}</div>)
            : sells
                .map((order, index) => {
                  const pct = maxCumulative ? (order.cumulative / maxCumulative) * 100 : 0
                  return (
                    <div
                      key={`sell-${index}`}
                      className="relative flex justify-between py-1 px-4"
                      style={{
                        background: `linear-gradient(to left, rgba(239,68,68,0.2) ${pct}%, transparent ${pct}%)`
                      }}
                    >
                      <span className="text-[#E2464A] font-medium text-xs">{order.px}</span>
                      <span className="text-white text-xs opacity-90">{order.sz}</span>
                      {showTotalColumn && (
                        <span className="text-white text-xs opacity-90">
                          {order.cumulative.toFixed(2)}
                        </span>
                      )}
                    </div>
                  )
                })
                .reverse()}
        </div>

        {/* Middle - Fixed Price */}
        {allMids[selectedAsset] && (
          <div className="z-10 pointer-events-none">
            <div className="flex justify-between items-center rounded-md px-4 py-2 pointer-events-auto">
              <p
                className={`text-lg font-semibold font-proxima-nova ${
                  priceChange === 'up'
                    ? 'text-[#2FA766]'
                    : priceChange === 'down'
                      ? 'text-[#E2464A]'
                      : 'text-white'
                }`}
              >
                ${allMids[selectedAsset]}
                {priceChange === 'up' ? (
                  <IconArrowUp className="w-4 h-4 inline" />
                ) : (
                  <IconArrowDown className="w-4 h-4 inline" />
                )}
              </p>
            </div>
          </div>
        )}

        {/* Bottom - Buys */}
        <div className="overflow-y-auto no-scrollbar h-[50%]">
          {isLoading
            ? Array(10)
                .fill(0)
                .map((_, i) => <div key={i}>{renderSkeletonRow(false, i)}</div>)
            : buys.map((order, index) => {
                const pct = maxCumulative ? (order.cumulative / maxCumulative) * 100 : 0
                return (
                  <div
                    key={`buy-${index}`}
                    className="relative flex justify-between py-1 px-4"
                    style={{
                      background: `linear-gradient(to left, rgba(34,197,94,0.2) ${pct}%, transparent ${pct}%)`
                    }}
                  >
                    <span className="text-[#2FA766] font-medium text-xs">{order.px}</span>
                    <span className="text-white text-xs opacity-90">{order.sz}</span>
                    {showTotalColumn && (
                      <span className="text-white text-xs opacity-90">
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
