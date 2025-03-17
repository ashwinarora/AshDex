"use client"
import { useState } from "react";

import Chart from "./Chart"
import OrderBook from "./OrderBook"
import Selector from "./Selector"
import PlaceOrder from "./PlaceOrder/PlaceOrder";
import UserData from "./UserData/UserData";

const Trading = () => {
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC-PERP");

  return (
    <>
      <div>
        <div className="grid grid-cols-[2fr_6fr_3fr] grid-rows-[1fr_6fr_0fr] gap-0  mt-2 h-screen">
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
          <div className="border p-4 col-span-full">
            <UserData />
          </div>
        </div>
      </div>

    </>
  )
}

export default Trading