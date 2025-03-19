'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useHyperLiquid } from '../../context/HyperLiquid'
import type { WsBook, WsLevel } from '../../utils/hyperLiquidTypes'
import ThreeDot from '../../assets/images/ThreeDot.svg'
import Filter1 from '../../assets/images/Filter1.svg'
import Filter2 from '../../assets/images/Filter2.svg'
import Filter3 from '../../assets/images/Filter3.svg'

interface IOrderBookProps {
  selectedAsset: string
}

const OrderBook = ({ selectedAsset }: IOrderBookProps) => {
  const { sdk, isSdkConnected } = useHyperLiquid()
  const [l2Book, setL2Book] = useState<WsBook>()

  useEffect(() => {
    if (!isSdkConnected) return
    if (!selectedAsset.length) return
    sdk.subscriptions.subscribeToL2Book(selectedAsset, (data: WsBook) => {
      setL2Book(data)
    })
    return () => {
      sdk.subscriptions.unsubscribeFromL2Book(selectedAsset)
    }
  }, [selectedAsset, isSdkConnected, sdk])

  const processOrders = (orders: WsLevel[]) => {
    let runningTotal = 0
    const processed = orders.map(order => {
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

  return (
    <div className="w-full text-gray-200 font-mono text-sm">
      <div>
        <div className="flex p-4 justify-between">
          <p className="text-sm font-bold text-[#FFFFFF]">Order Book</p>

          <div className="flex items-center">
            <Image src={ThreeDot} alt="" className="w-5 h-5" />
          </div>
        </div>
      </div>
      <div className="flex justify-between text-gray-300 pt-2 px-3 border-t border-white/10 my-1">
        <div className="flex items-center">
          <Image src={Filter1} alt="" className="w-5 h-5 mx-1" />
          <Image src={Filter2} alt="" className="w-5 h-5 mx-1" />
          <Image src={Filter3} alt="" className="w-5 h-5 mx-1" />
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
      <div className="flex w-full max-[1025px]:hidden opacity-60 justify-between text-[#E8E0F1] font-medium px-4 py-3 my-1">
        <span className="text-xs font-medium">Price (USDS)</span>
        <span className="text-xs font-medium">Amount (BTC)</span>
        <span className="text-xs font-medium">Total</span>
      </div>

      <div className="flex max-[1025px]:flex-row flex-col space-y-1">
        {/* red */}
        <div className="max-[1025px]:w-1/2">
          <div className="max-[1025px]:flex hidden w-full opacity-60 text-[#E8E0F1] font-medium px-2 py-3 my-1">
            <span className="text-xs font-medium w-1/2 text-left">Price (USDS)</span>
            <span className="text-xs font-medium w-1/2 text-right">Amount (BTC)</span>
          </div>
          <div className="w-full">
            {sells
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
                    <span className="text-[#E2464A]  font-medium text-xs">{order.px}</span>
                    <span className="text-[#FFFFFF] text-xs font-normal opacity-90">
                      {order.sz}
                    </span>
                    <span className="text-[#FFFFFF] text-xs font-normal opacity-90 max-[1025px]:hidden">
                      {order.cumulative.toFixed(2)}
                    </span>
                  </div>
                )
              })
              .reverse()}
          </div>
        </div>
        <div className="max-[1025px]:hidden flex justify-between text-xs text-gray-400 py-1 px-2 border-t border-b border-gray-700 my-1">
          <span>Spread</span>
          <span>{spread.toFixed(4)}</span>
          <span>{spreadPercent.toFixed(2)}%</span>
        </div>
        {/* green */}
        <div className="max-[1025px]:w-1/2">
          <div className="max-[1025px]:flex hidden w-full opacity-60 text-[#E8E0F1] font-medium px-2 py-3 my-1">
            <span className="text-xs font-medium w-1/2 text-left">Price (USDS)</span>
            <span className="text-xs font-medium w-1/2 text-right">Amount (BTC)</span>
          </div>
          <div className="w-full">
            {buys.slice(0, 10).map((order, index) => {
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
                  <span className="text-[#FFFFFF] text-xs font-normal opacity-90">{order.sz}</span>
                  <span className="text-[#FFFFFF] text-xs font-normal opacity-90 max-[1025px]:hidden">
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
