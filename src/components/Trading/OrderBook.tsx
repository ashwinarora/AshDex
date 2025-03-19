"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { HyperLiquidContext } from "../../context/HyperLiquid";
import type { WsBook, WsLevel } from "../../utils/hyperLiquidTypes";
import ThreeDot from "../../assets/images/ThreeDot.svg";
import Filter1 from "../../assets/images/Filter1.svg";
import Filter2 from "../../assets/images/Filter2.svg";
import Filter3 from "../../assets/images/Filter3.svg";
import Image from "next/image";

interface IOrderBookProps {
  selectedAsset: string;
}

const OrderBook = ({ selectedAsset }: IOrderBookProps) => {
  const { sdk, isSdkConnected } = useHyperLiquid()
  const [l2Book, setL2Book] = useState<WsBook>();

  useEffect(() => {
    if (!isSdkConnected) return;
    if (!selectedAsset.length) return;
    sdk.subscriptions.subscribeToL2Book(selectedAsset, (data: WsBook) => {
      setL2Book(data);
    });
    return () => {
      sdk.subscriptions.unsubscribeFromL2Book(selectedAsset);
    };
  }, [selectedAsset, isSdkConnected, sdk]);

  const processOrders = (orders: WsLevel[]) => {
    let runningTotal = 0;
    const processed = orders.map((order) => {
      runningTotal += Number(order.sz);
      return {
        ...order,
        cumulative: runningTotal,
      };
    });
    return processed;
  };

  const [rawBuys, rawSells] = l2Book?.levels ?? [[], []];

  const sells = useMemo(() => processOrders(rawSells.slice(0, 10)), [rawSells]);

  const buys = useMemo(() => processOrders(rawBuys.slice(0, 10)), [rawBuys]);

  const bestAsk = sells.length > 0 ? sells[0].px : 0;
  const bestBid = buys.length > 0 ? buys[0].px : 0;
  const spread = bestAsk && bestBid ? Number(bestAsk) - Number(bestBid) : 0;
  const spreadPercent = bestAsk ? (spread / Number(bestAsk)) * 100 : 0;

  const maxSellCumulative =
    sells.length > 0 ? sells[sells.length - 1].cumulative : 0;
  const maxBuyCumulative =
    buys.length > 0 ? buys[buys.length - 1].cumulative : 0;
  const maxCumulative = Math.max(maxSellCumulative, maxBuyCumulative);

  return (
    <div className="w-full text-gray-200 font-mono text-sm">
      <div>
        <div className="flex justify-between">
          <h1 className="text-lg font-bold text-white">Order Book</h1>

          <div className="flex items-center">
            <Image src={ThreeDot} alt="" className="w-5 h-5" />
          </div>
        </div>
      </div>
      <div className="flex justify-between text-gray-300 py-1 px-2 border-t border-gray-700 my-1">
        <div className="flex items-center">
          <Image src={Filter1} alt="" className="w-5 h-5 mx-1" />
          <Image src={Filter2} alt="" className="w-5 h-5 mx-1" />
          <Image src={Filter3} alt="" className="w-5 h-5 mx-1" />
        </div>
        <div>
          <select className="text-[#8B8BA0] p-2 rounded-lg">
            <option value="0.01">0.01</option>
            <option value="0.1">0.1</option>
            <option value="1">1</option>
            <option value="10">10</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
      <div className="flex justify-between text-gray-300 py-1 px-2 border-t border-b border-gray-700 my-1">
        <span>Price (USDS)</span>
        <span>AmOUNT (BTC)</span>
        <span>Total</span>
      </div>
      <div className="flex flex-col space-y-1">
        {sells
          .map((order, index) => {
            const percentage = maxCumulative
              ? (order.cumulative / maxCumulative) * 100
              : 0;

            return (
              <div
                key={`sell-${index}`}
                className="relative flex justify-between py-0 px-2"
                style={{
                  background: `linear-gradient(to right, rgba(239,68,68,0.2) ${percentage}%, transparent ${percentage}%)`,
                }}
              >
                <span className="text-red-500">{order.px}</span>
                <span>{order.sz}</span>
                <span>{order.cumulative.toFixed(2)}</span>
              </div>
            );
          })
          .reverse()}

        <div className="flex justify-between text-xs text-gray-400 py-1 px-2 border-t border-b border-gray-700 my-1">
          <span>Spread</span>
          <span>{spread.toFixed(4)}</span>
          <span>{spreadPercent.toFixed(2)}%</span>
        </div>

        {buys.slice(0, 10).map((order, index) => {
          const percentage = maxCumulative
            ? (order.cumulative / maxCumulative) * 100
            : 0;

          return (
            <div
              key={`buy-${index}`}
              className="relative flex justify-between py-0 px-2"
              style={{
                background: `linear-gradient(to right, rgba(34,197,94,0.2) ${percentage}%, transparent ${percentage}%)`,
              }}
            >
              <span className="text-green-500">{order.px}</span>
              <span>{order.sz}</span>
              <span>{order.cumulative.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderBook;
