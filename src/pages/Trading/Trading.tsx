"use client"

import { useState } from "react";
import Chart from "./Chart"
import OrderBook from "./OrderBook"
import Selector from "./Selector"
import PlaceOrder from "./PlaceOrder/PlaceOrder";


const Trading = () => {
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC-PERP");

  return (
    <div className="grid grid-cols-[2fr_6fr_3fr] grid-rows-[1fr_6fr_2fr] gap-0 border mt-2 h-screen">
      <div className="border p-4 col-span-2">
        <Selector selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} />
      </div>
      <div className="border p-4 row-span-2">
        <PlaceOrder selectedAsset={selectedAsset} />
      </div>
      <div className="border p-4">
        <OrderBook selectedAsset={selectedAsset} />
      </div>
      <div className="border p-4">
        <Chart selectedAsset={selectedAsset} />
      </div>
      <div className="border p-4 col-span-full">Footer Data</div>
    </div>
  )
}

export default Trading