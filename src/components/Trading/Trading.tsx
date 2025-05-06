'use client'
import { useState } from 'react'
import { TRADING_TABS } from '@/utils/constants'
import Chart from './Chart'
import OrderBook from './OrderBook'
import Selector from './Selector'
import PlaceOrder from './PlaceOrderBox'
import UserData from './UserData/UserData'
import FavoriteStrip from '../FavoriteStrip/FavoriteStrip'
import useIsSpot from '@/hooks/useIsSpot'

const Trading = () => {
  const isSpot = useIsSpot()
  const [selectedAsset, setSelectedAsset] = useState<string>(isSpot ? 'HYPE-SPOT' : 'BTC-PERP')
  const [activeTab, setActiveTab] = useState(0)
  const components = [
    <Chart key="chart" selectedAsset={selectedAsset} />,
    <OrderBook key="orderbook" selectedAsset={selectedAsset} />,
    <PlaceOrder key="placeorder" selectedAsset={selectedAsset} />
  ]
  return (
    <>
      <FavoriteStrip setSelectedAsset={setSelectedAsset} />
      <div className="h-full bg-transparent flex flex-col px-4 md:px-10 gap-4 p-2">
        {/* Top Bar for Asset Selector */}
        <div className="flex justify-between items-center relative">
          <Selector selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} />
        </div>
        {/* Mobile view tabs */}
        <nav className="hidden max-xl:flex border-b mb-2 border-white/10 max-sm:justify-between justify-evenly flex-wrap gap-x-5 w-full">
          {TRADING_TABS?.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`py-2 px-1 font-medium text-base border-b-3 w-1/4 cursor-pointer whitespace-nowrap 
          ${activeTab === index ? 'border-primary text-white rounded-xs ' : 'border-transparent text-[#8B8BA0]'}
        `}
            >
              {tab}
            </button>
          ))}
        </nav>
        {/* Main Trading Layout */}
        <div className="flex flex-col gap-4 flex-1">
          <div
            className={`w-full gap-4 grid grid-cols-1 xl:grid-cols-6 2xl:grid-cols-5 xl:h-[60vh]`}
          >
            {/* Chart on top in mobile, middle in desktop */}
            <div className="hidden xl:block order-1 xl:order-2 xl:col-span-3 nexon-card overflow-hidden">
              <Chart selectedAsset={selectedAsset} />
            </div>

            {/* OrderBook: Left on desktop, middle in mobile */}
            <div className="hidden xl:block order-2 xl:order-1 xl:col-span-1 overflow-hidden nexon-card">
              <OrderBook selectedAsset={selectedAsset} />
            </div>

            {/* PlaceOrder: Right on desktop, bottom in mobile */}
            <div className="hidden xl:block order-3 xl:order-3 xl:col-span-2 2xl:col-span-1 nexon-card overflow-hidden">
              <PlaceOrder selectedAsset={selectedAsset} />
            </div>
            {/* Mobile view active tab */}
            <div className="nexon-card block xl:hidden overflow-hidden">
              {components[activeTab]}
            </div>
          </div>
          <div className="nexon-card flex-1 min-h-[200px]">
            <UserData />
          </div>
        </div>
      </div>
    </>
  )
}

export default Trading
