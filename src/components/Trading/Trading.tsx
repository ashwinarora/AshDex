'use client'
import { useState } from 'react'
import { isTestnet } from '@/utils/constants'
import Chart from './Chart'
import OrderBook from './OrderBook'
import PlaceOrder from './PlaceOrderBox'
import UserData from './UserData/UserData'
import FavoriteStrip from '../FavoriteStrip/FavoriteStrip'
import useIsSpot from '@/hooks/useIsSpot'
import OverviewBox from './OverviewBox'
import PerpsSelector from './Selector/PerpsSelector'
import SpotSelector from './Selector/SpotSelector'
import { useScreenSize } from '@/hooks/useScreenSize'

const Trading = () => {
  const isSpot = useIsSpot()
  const [selectedAsset, setSelectedAsset] = useState<string>(
    isSpot ? (isTestnet ? '@1035' : '@107') : 'BTC'
  ) // @1035 and @107 is HYPE

  const { isTablet } = useScreenSize()

  if (isTablet) {
    return (
      <div className="hidden md:flex xl:hidden flex-col gap-1 p-1 mb-8 h-fit w-full">
        <FavoriteStrip setSelectedAsset={setSelectedAsset} />
        {isSpot ? (
          <SpotSelector selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} />
        ) : (
          <PerpsSelector selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} />
        )}
        <Chart selectedAsset={selectedAsset} selectedInterval="30" />
        <div className="flex items-start justify-center w-full h-full max-h-[672px] gap-1">
          <div className="h-full flex-1 flex-col basis-sm gap-2 bg-secondary rounded-md">
            <OrderBook selectedAsset={selectedAsset} />
          </div>
          <div className="h-full max-w-sm flex-1 flex-col basis-sm gap-2 bg-secondary rounded-md">
            <PlaceOrder selectedAsset={selectedAsset} />
          </div>
        </div>
        <div className="flex items-start justify-center w-full h-[484px] gap-1">
          <div className="h-full flex-1 flex-col basis-sm gap-2 bg-secondary rounded-md">
            <UserData setSelectedAsset={setSelectedAsset} />
          </div>
          <div className="h-full max-w-sm flex-1 flex-col basis-sm gap-2 bg-secondary rounded-md">
            <OverviewBox />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="hidden xl:flex flex-col gap-1 p-1 mb-8 h-fit w-full">
      <div className="flex-1 grid grid-cols-18 gap-1 max-h-3/4 h-3/4 min-h-3/4 overflow-hidden">
        <div className="col-span-10 h-full flex-1 basis-xl flex flex-col gap-1">
          <FavoriteStrip setSelectedAsset={setSelectedAsset} />
          {isSpot ? (
            <SpotSelector selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} />
          ) : (
            <PerpsSelector selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} />
          )}
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
        <div className="col-span-14 h-full w-full rounded-md bg-secondary">
          <UserData setSelectedAsset={setSelectedAsset} />
        </div>
        <div className="col-span-4 h-full w-full rounded-md bg-secondary">
          <OverviewBox />
        </div>
      </div>
    </div>
  )
}

export default Trading
