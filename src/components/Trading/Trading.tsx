'use client'
import { useState } from 'react'
// import { TRADING_TABS } from '@/utils/constants'
import Chart from './Chart'
import OrderBook from './OrderBook'
import PlaceOrder from './PlaceOrderBox'
import UserData from './UserData/UserData'
import FavoriteStrip from '../FavoriteStrip/FavoriteStrip'
import useIsSpot from '@/hooks/useIsSpot'
import OverviewBox from './OverviewBox'
import PerpsSelector from './Selector/PerpsSelector'
import SpotSelector from './Selector/SpotSelector'

const Trading = () => {
  const isSpot = useIsSpot()
  const [selectedAsset, setSelectedAsset] = useState<string>(isSpot ? '@1035' : 'BTC') // @1035 is HYPE
  return (
    <div className="flex flex-col gap-1 p-1 h-screen w-full">
      <div className="flex-1 grid grid-cols-18 gap-1 max-h-3/4 h-3/4 min-h-3/4 overflow-hidden">
        <div className="col-span-10 h-full flex-1 basis-xl flex flex-col gap-1">
          <FavoriteStrip setSelectedAsset={setSelectedAsset} />
          <div className="relative flex justify-between items-center">
            {isSpot ? (
              <SpotSelector selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} />
            ) : (
              <PerpsSelector selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} />
            )}
          </div>
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
          <UserData setSelectedAsset={setSelectedAsset} />
        </div>
        <div className="flex-1 col-span-4 h-full nexon-card">
          <OverviewBox />
        </div>
      </div>
    </div>
  )
}

export default Trading
