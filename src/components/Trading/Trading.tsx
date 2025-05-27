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
    <Chart key="chart" selectedAsset={selectedAsset} selectedInterval="30" />,
    <OrderBook key="orderbook" selectedAsset={selectedAsset} />,
    <PlaceOrder key="placeorder" selectedAsset={selectedAsset} />
  ]
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-2 bg-transparent">
        {/* Top Bar for Asset Selector */}

        {/* Mobile view tabs */}
        <nav className="flex-wrap hidden w-full mb-2 border-b max-xl:flex justify-evenly max-sm:justify-between gap-x-5 border-white/10">
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
        <div className="flex flex-col flex-1 gap-2">
          <div className={`w-full gap-1 grid grid-cols-1 xl:grid-cols-6 2xl:grid-cols-5 h-[60vh]`}>
            {/* Chart on top in mobile, middle in desktop */}
            <div className="order-1 hidden gap-1 overflow-hidden rounded-lg xl:flex xl:flex-col xl:order-1 xl:col-span-3">
              <FavoriteStrip setSelectedAsset={setSelectedAsset} />
              <div className="relative flex items-center justify-between">
                <Selector selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} />
              </div>
              <Chart selectedAsset={selectedAsset} selectedInterval="30" />
            </div>

            {/* OrderBook: Left on desktop, middle in mobile */}
            <div className="order-2 hidden overflow-hidden xl:block xl:order-2 xl:col-span-1 nexon-card">
              <OrderBook selectedAsset={selectedAsset} />
            </div>

            {/* PlaceOrder: Right on desktop, bottom in mobile */}
            <div className="order-3 hidden overflow-hidden xl:block xl:order-3 2xl:col-span-1 xl:col-span-2 nexon-card">
              <PlaceOrder selectedAsset={selectedAsset} />
            </div>
            {/* Mobile view active tab */}
            <div className="block overflow-hidden xl:hidden nexon-card">
              {components[activeTab]}
            </div>
          </div>
          <div className="flex-1 min-h-[200px] nexon-card">
            <UserData />
          </div>
        </div>
      </div>
    </>
  )
}

export default Trading
