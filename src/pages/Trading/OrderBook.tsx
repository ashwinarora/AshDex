"use client"

import { useEffect, useMemo, useState } from 'react';
import { useHyperLiquid } from '../../context/HyperLiquid';
import type { WsBook, WsLevel } from '../../utils/hyperLiquidTypes';

interface IOrderBookProps {
  selectedAsset: string;
}

const OrderBook = ({selectedAsset}: IOrderBookProps) => {
  const { sdk, isSdkConnected } = useHyperLiquid();
  const [l2Book, setL2Book] = useState<WsBook>();

  useEffect(() => {
    if(!isSdkConnected) return;
    if(!selectedAsset.length) return;
    sdk.subscriptions.subscribeToL2Book(selectedAsset, (data: WsBook ) => {
      setL2Book(data);
    });
    return () => {
      sdk.subscriptions.unsubscribeFromL2Book(selectedAsset);
    }
  }, [selectedAsset, isSdkConnected]);

  const processOrders = (
    orders: WsLevel[],
  ) => {
    let runningTotal = 0;
    const processed = orders.map((order) => {
      runningTotal += Number(order.sz);
      return {
        ...order,
        cumulative: runningTotal,
      };
    });
    return processed;
  }

  const [rawBuys, rawSells] = l2Book?.levels ?? [[], []];
  
  const sells = useMemo(
    () => processOrders(rawSells.slice(0, 10)),
    [rawSells]
  );
  
  const buys = useMemo(
    () => processOrders(rawBuys.slice(0, 10)),
    [rawBuys]
  );
  

  const bestAsk = sells.length > 0 ? sells[0].px : 0;
  const bestBid = buys.length > 0 ? buys[0].px : 0;
  const spread = bestAsk && bestBid ? Number(bestAsk) - Number(bestBid) : 0;
  const spreadPercent = bestAsk ? (spread / Number(bestAsk)) * 100 : 0;

  const maxSellCumulative = sells.length > 0 ? sells[sells.length - 1].cumulative : 0;
  const maxBuyCumulative = buys.length > 0 ? buys[buys.length - 1].cumulative : 0;
  const maxCumulative = Math.max(maxSellCumulative, maxBuyCumulative);

  return (
    <div className="w-full text-gray-200 font-mono text-sm">
      <div className="flex justify-between text-gray-300 py-1 px-2 border-t border-b border-gray-700 my-1">
        <span>Price</span>
        <span>Size</span>
        <span>Total</span>
      </div>
      <div className="flex flex-col space-y-1">
        {sells.map((order, index) => {
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
        }).reverse()}

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
