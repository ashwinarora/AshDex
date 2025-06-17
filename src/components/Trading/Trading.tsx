'use client'
import { useState } from 'react'
import { TRADING_TABS } from '@/utils/constants'
import Chart from './Chart'
import OrderBook from './OrderBook'
import Selector from './Selector/Selector'
import PlaceOrder from './PlaceOrderBox'
import UserData from './UserData/UserData'
import FavoriteStrip from '../FavoriteStrip/FavoriteStrip'
import useIsSpot from '@/hooks/useIsSpot'
import OverviewBox from './OverviewBox'

const Trading = () => {
  const isSpot = useIsSpot()
  const [selectedAsset, setSelectedAsset] = useState<string>(isSpot ? '@1035' : 'BTC') // @1035 is HYPE
  const [activeTab, setActiveTab] = useState(0)
  const components = [
    <Chart key="chart" selectedAsset={selectedAsset} selectedInterval="30m" />,
    <OrderBook key="orderbook" selectedAsset={selectedAsset} />,
    <PlaceOrder key="placeorder" selectedAsset={selectedAsset} />
  ]
  return (
    <>
      <div className="flex flex-col gap-2 bg-transparent p-1 h-full">
        {/* Top Bar for Asset Selector */}

        {/* Mobile view tabs */}
        <nav className="hidden max-xl:flex flex-wrap justify-evenly max-sm:justify-between gap-x-5 mb-2 border-white/10 border-b w-full">
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
        <div className="flex flex-col flex-1 gap-1">
          <div className={`w-full gap-1 grid grid-cols-1 xl:grid-cols-18  h-[80vh] xl:h-[75vh]`}>
            {/* Chart on top in mobile, middle in desktop */}
            <div className="hidden xl:flex xl:flex-col gap-1 order-1 xl:order-1 xl:col-span-11 rounded-lg overflow-hidden">
              <FavoriteStrip setSelectedAsset={setSelectedAsset} />
              <div className="relative flex justify-between items-center">
                <Selector selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} />
              </div>
              <Chart selectedAsset={selectedAsset} selectedInterval="30m" />
            </div>

            {/* OrderBook: Left on desktop, middle in mobile */}
            <div className="hidden xl:block order-2 xl:order-2 xl:col-span-3 overflow-hidden nexon-card">
              <OrderBook selectedAsset={selectedAsset} />
            </div>

            {/* PlaceOrder: Right on desktop, bottom in mobile */}
            <div className="hidden xl:block order-3 xl:order-3 xl:col-span-4 overflow-hidden nexon-card">
              <PlaceOrder selectedAsset={selectedAsset} />
            </div>
            {/* Mobile view active tab */}
            <div className="xl:hidden block overflow-hidden nexon-card">
              {components[activeTab]}
            </div>
          </div>
          <div className="gap-1 grid grid-cols-18 min-h-[500px]">
            <div className="flex-1 col-span-14 h-full nexon-card">
              <UserData />
            </div>
            <div className="flex-1 col-span-4 h-full nexon-card">
              <OverviewBox />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Trading
