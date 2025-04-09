'use client'
import { useState } from 'react'
import Chart from './Chart'
import OrderBook from './OrderBook'
import Selector from './Selector'
import PlaceOrder from './PlaceOrderBox'
import UserData from './UserData/UserData'
const Trading = () => {
  const [selectedAsset, setSelectedAsset] = useState<string>('BTC-PERP')

  return (
    <div className="h-full bg-transparent   flex flex-col px-4 md:px-10 gap-4 p-4">
      {/* Top Bar for Asset Selector */}
      <div className="flex   justify-between items-center   relative">
        <Selector selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} />
      </div>
      {/* Main Trading Layout */}
      <div className="flex gap-6  flex-col ">
        <div
          className={`
    w-full gap-4  
    grid grid-cols-1
    lg:grid-cols-5
     
  `}
        >
          {/* Chart on top in mobile, middle in desktop */}
          <div className="order-1 lg:order-2 lg:col-span-3 nexon-card">
            <Chart selectedAsset={selectedAsset} />
          </div>

          {/* OrderBook: Left on desktop, middle in mobile */}
          <div className="order-2 lg:order-1 lg:col-span-1 nexon-card">
            <OrderBook selectedAsset={selectedAsset} />
          </div>

          {/* PlaceOrder: Right on desktop, bottom in mobile */}
          <div className="order-3 lg:order-3 lg:col-span-1 nexon-card">
            <PlaceOrder selectedAsset={selectedAsset} />
          </div>
        </div>

        <div className="nexon-card ">
          <UserData />
        </div>
      </div>
    </div>
  )
}

export default Trading
