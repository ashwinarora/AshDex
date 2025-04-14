'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useHyperLiquid } from '../../context/HyperLiquid'
import type { WsBook, WsLevel } from '../../utils/hyperliquid/hyperLiquidTypes'
import ThreeDot from '../../assets/images/three_dot.svg'
import Filter1 from '../../assets/images/filter_1.svg'
import Filter2 from '../../assets/images/filter_2.svg'
import Filter3 from '../../assets/images/filter_3.svg'
import Skeleton from '../common/Skeleton'
import { SkeletonSize } from '../common/Skeleton'

interface IOrderBookProps {
  selectedAsset: string
}

const OrderBook = ({ selectedAsset }: IOrderBookProps) => {
  const { sdk, isSdkConnected } = useHyperLiquid()
  const [l2Book, setL2Book] = useState<WsBook>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isSdkConnected) return
    if (!selectedAsset.length) return

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
    const processed = orders.map((order) => {
      runningTotal += Number(order.sz)
      return {
        ...order,
        cumulative: runningTotal
      }
    })
    return processed
  }

  const [rawBuys, rawSells] = l2Book?.levels ?? [[], []]

  const sells = useMemo(() => processOrders(rawSells.slice(0, 10)), [rawSells])
  const buys = useMemo(() => processOrders(rawBuys.slice(0, 10)), [rawBuys])

  const bestAsk = sells.length > 0 ? sells[0].px : 0
  const bestBid = buys.length > 0 ? buys[0].px : 0
  const spread = bestAsk && bestBid ? Number(bestAsk) - Number(bestBid) : 0
  const spreadPercent = bestAsk ? (spread / Number(bestAsk)) * 100 : 0

  const maxSellCumulative = sells.length > 0 ? sells[sells.length - 1].cumulative : 0
  const maxBuyCumulative = buys.length > 0 ? buys[buys.length - 1].cumulative : 0
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

  return (
    <div className="w-full text-gray-200 font-mono text-sm">
      <div>
        <div className="flex p-4 justify-between">
          <p className="text-sm font-bold text-[#FFFFFF]">Order Book</p>
          <div className="flex items-center">
            <Image src={ThreeDot} alt="" width={20} height={20} className="w-5 h-5" />
          </div>
        </div>
      </div>
      <div className="flex justify-between text-gray-300 pt-2 px-3 border-t border-white/10 my-1">
        <div className="flex items-center">
          <Image src={Filter1} alt="" width={20} height={20} className="w-5 h-5 mx-1" />
          <Image src={Filter2} alt="" width={20} height={20} className="w-5 h-5 mx-1" />
          <Image src={Filter3} alt="" width={20} height={20} className="w-5 h-5 mx-1" />
        </div>
        <div>
          <select className="text-[#8B8BA0] text-xs font-medium p-2 rounded-lg">
            <option value="0.01">0.01</option>
            <option value="0.1">0.1</option>
            <option value="1">1</option>
            <option value="10">10</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
      <div className="flex w-full max-xl:hidden opacity-60 justify-between text-[#E8E0F1] font-medium px-4 py-3 my-1">
        <span className="text-xs font-medium">Price (USDS)</span>
        <span className="text-xs font-medium">Amount (BTC)</span>
        <span className="text-xs font-medium">Total</span>
      </div>

      <div className="flex max-xl:flex-row flex-col space-y-1">
        {/* red */}
        <div className="max-xl:w-1/2">
          <div className="max-xl:flex hidden w-full opacity-60 text-[#E8E0F1] font-medium px-2 py-3 my-1">
            <span className="text-xs font-medium w-1/2 text-left">Price (USDS)</span>
            <span className="text-xs font-medium w-1/2 text-right">Amount (BTC)</span>
          </div>
          <div className="w-full">
            {isLoading
              ? // Skeleton loading state for sells
                Array(10)
                  .fill(0)
                  .map((_, index) => (
                    <div key={`skeleton-sell-${index}`}>{renderSkeletonRow(true, index)}</div>
                  ))
              : sells
                  .map((order, index) => {
                    const percentage = maxCumulative ? (order.cumulative / maxCumulative) * 100 : 0
                    return (
                      <div
                        key={`sell-${index}`}
                        className="relative flex justify-between py-1 px-4"
                        style={{
                          background: `linear-gradient(to right, rgba(239,68,68,0.2) ${percentage}%, transparent ${percentage}%)`
                        }}
                      >
                        <span className="text-[#E2464A] font-medium text-xs">{order.px}</span>
                        <span className="text-[#FFFFFF] text-xs font-normal opacity-90">
                          {order.sz}
                        </span>
                        <span className="text-[#FFFFFF] text-xs font-normal opacity-90 max-xl:hidden">
                          {order.cumulative.toFixed(2)}
                        </span>
                      </div>
                    )
                  })
                  .reverse()}
          </div>
        </div>
        <div className="max-xl:hidden flex justify-between text-xs text-gray-400 py-1 px-2 border-t border-b border-gray-700 my-1">
          <span>Spread</span>
          <span>
            {isLoading ? (
              <Skeleton size="sm" color="bg-white/10" className="w-16" />
            ) : (
              spread.toFixed(4)
            )}
          </span>
          <span>
            {isLoading ? (
              <Skeleton size="sm" color="bg-white/10" className="w-12" />
            ) : (
              `${spreadPercent.toFixed(2)}%`
            )}
          </span>
        </div>
        {/* green */}
        <div className="max-xl:w-1/2">
          <div className="max-xl:flex hidden w-full opacity-60 text-[#E8E0F1] font-medium px-2 py-3 my-1">
            <span className="text-xs font-medium w-1/2 text-left">Price (USDS)</span>
            <span className="text-xs font-medium w-1/2 text-right">Amount (BTC)</span>
          </div>
          <div className="w-full">
            {isLoading
              ? // Skeleton loading state for buys
                Array(10)
                  .fill(0)
                  .map((_, index) => (
                    <div key={`skeleton-buy-${index}`}>{renderSkeletonRow(false, index)}</div>
                  ))
              : buys.map((order, index) => {
                  const percentage = maxCumulative ? (order.cumulative / maxCumulative) * 100 : 0
                  return (
                    <div
                      key={`buy-${index}`}
                      className="relative flex justify-between py-1 px-4"
                      style={{
                        background: `linear-gradient(to right, rgba(34,197,94,0.2) ${percentage}%, transparent ${percentage}%)`
                      }}
                    >
                      <span className="text-[#2FA766] font-medium text-xs">{order.px}</span>
                      <span className="text-[#FFFFFF] text-xs font-normal opacity-90">
                        {order.sz}
                      </span>
                      <span className="text-[#FFFFFF] text-xs font-normal opacity-90 max-xl:hidden">
                        {order.cumulative.toFixed(2)}
                      </span>
                    </div>
                  )
                })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderBook
