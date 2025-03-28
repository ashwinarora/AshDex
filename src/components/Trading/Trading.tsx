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
    <div className="h-full bg-[#0d021f] text-white p-4">
      {/* Top Bar for Asset Selector */}
      <div className="flex max-[1315px]:mx-1 mx-10 justify-between items-center mb-4 relative">
        <Selector selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} />
      </div>
      {/* Main Trading Layout */}
      <div className="flex flex-wrap max-[1315px]:mx-1 mx-10  xl:grid xl:grid-cols-[2fr_5fr_3fr] xl:grid-rows-[3fr_2fr] gap-4">
        <div
          className="rounded-xl shadow-md border-2 border-white/10 backdrop-blur-[40px] w-full xl:w-auto"
          style={{
            background:
              'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
          }}
        >
          <OrderBook selectedAsset={selectedAsset} />
        </div>
        <div
          className="rounded-xl shadow-md border-2 border-white/10 backdrop-blur-[40px] w-full xl:w-auto"
          style={{
            background:
              'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
          }}
        >
          <Chart selectedAsset={selectedAsset} />
        </div>
        <div
          className="rounded-xl shadow-md border-2 border-white/10 backdrop-blur-[40px] w-full xl:w-auto"
          style={{
            background:
              'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
          }}
        >
          <PlaceOrder selectedAsset={selectedAsset} />
        </div>
        <div
          style={{
            background:
              'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
          }}
          className="bg-[#1A0B35] border-2 border-white/10 backdrop-blur-[40px] rounded-xl shadow-md w-full xl:col-span-3"
        >
          <UserData />
        </div>
      </div>
    </div>
  )
}

export default Trading
