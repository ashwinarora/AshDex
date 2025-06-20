'use client'
import { useState } from 'react'
// import { TRADING_TABS } from '@/utils/constants'
import Chart from './Chart'
import OrderBook from './OrderBook'
// import Selector from './Selector'
import PlaceOrder from './PlaceOrderBox'
import UserData from './UserData/UserData'
import FavoriteStrip from '../FavoriteStrip/FavoriteStrip'
import useIsSpot from '@/hooks/useIsSpot'
import OverviewBox from './OverviewBox'

const Trading = () => {
  const isSpot = useIsSpot()
  const [selectedAsset, setSelectedAsset] = useState<string>(isSpot ? 'HYPE-SPOT' : 'BTC-PERP')
  // const [activeTab, setActiveTab] = useState(0)
  // const components = [
  //   <Chart key="chart" selectedAsset={selectedAsset} selectedInterval="30" />,
  //   <OrderBook key="orderbook" selectedAsset={selectedAsset} />,
  //   <PlaceOrder key="placeorder" selectedAsset={selectedAsset} />
  // ]
  return (
    <div className="flex flex-col gap-1 p-1 h-screen w-full">
      <div className="flex-1 grid grid-cols-18 gap-1 max-h-3/4 h-3/4 min-h-3/4 overflow-hidden">
        <div className="col-span-10 h-full flex-1 basis-xl flex flex-col gap-1">
          <FavoriteStrip setSelectedAsset={setSelectedAsset} />
          <Chart selectedAsset={selectedAsset} selectedInterval="30" />
        </div>
        <div className="col-span-4 h-full flex-col basis-sm gap-2 bg-secondary rounded-md">
          <OrderBook selectedAsset={selectedAsset} />
        </div>
        <div className="col-span-4 h-full flex-col basis-sm gap-2 bg-secondary rounded-md">
          <PlaceOrder selectedAsset={selectedAsset} />
        </div>
      </div>
      <div className="grid grid-cols-18 gap-1 h-fit">
        <div className="flex-1 col-span-14 h-full nexon-card">
          <UserData />
        </div>
        <div className="flex-1 col-span-4 h-full nexon-card">
          <OverviewBox />
        </div>
      </div>
    </div>
  )
}

export default Trading
