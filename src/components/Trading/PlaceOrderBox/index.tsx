'use client'
import { useState } from 'react'
import LimitOrder from './LimitOrder'
import MarketOrder from './MarketOrder'
import TWAP from './TWAP'
import Scale from './Scale'
import CustomSelector from './CustomSelector'
import StopLimit from './StopLimit'
import StopMarket from './StopMarket'
import useIsSpot from '@/hooks/useIsSpot'

/** Define the possible tab options */
type OrderTab = 'LIMIT' | 'MARKET' | 'TWAP' | 'SCALE' | 'STOP_LIMIT' | 'STOP_MARKET'

export interface IPlaceOrderProps {
  selectedAsset: string
}

const PlaceOrder = ({ selectedAsset }: IPlaceOrderProps) => {
  const [activeTab, setActiveTab] = useState<OrderTab>('LIMIT')
  const isSpot = useIsSpot()

  const renderTabContent = () => {
    switch (activeTab) {
      case 'LIMIT':
        return <LimitOrder selectedAsset={selectedAsset} />
      case 'MARKET':
        return <MarketOrder selectedAsset={selectedAsset} />
      case 'TWAP':
        return <TWAP selectedAsset={selectedAsset} />
      case 'SCALE':
        return <Scale selectedAsset={selectedAsset} />
      case 'STOP_LIMIT':
        return <StopLimit selectedAsset={selectedAsset} />
      case 'STOP_MARKET':
        return <StopMarket selectedAsset={selectedAsset} />
      default:
        return null
    }
  }

  const availableOptions = isSpot
    ? [
        { value: 'TWAP', label: 'TWAP' },
        { value: 'SCALE', label: 'SCALE' }
      ]
    : [
        { value: 'TWAP', label: 'TWAP' },
        { value: 'SCALE', label: 'SCALE' },
        { value: 'STOP_LIMIT', label: 'Stop Limit' },
        { value: 'STOP_MARKET', label: 'Stop Market' }
      ]

  return (
    <div>
      <div className="flex border-b border-white/10 pb-3 mb-2.5 items-center justify-evenly space-x-2 p-2 rounded-xl">
        <button
          onClick={() => setActiveTab('LIMIT')}
          className={`w-full  py-2 rounded-full transition-colors duration-200 cursor-pointer ${
            activeTab === 'LIMIT' ? 'bg-[#FFFFFF0F] text-white' : ' text-[#8B8BA0]'
          }`}
        >
          Limit
        </button>

        <button
          onClick={() => setActiveTab('MARKET')}
          className={`w-full  py-2 rounded-full transition-colors duration-200 cursor-pointer ${
            activeTab === 'MARKET' ? 'bg-[#FFFFFF0F] text-white' : ' text-[#8B8BA0]'
          }`}
        >
          Market
        </button>

        <button
          className={`w-full flex justify-center items-center text-center  py-2 rounded-full transition-colors duration-200 cursor-pointer ${
            activeTab === 'TWAP' || activeTab === 'SCALE'
              ? 'bg-[#FFFFFF0F] text-white'
              : ' text-[#8B8BA0]'
          }`}
        >
          <CustomSelector
            options={availableOptions}
            selectedValue={activeTab}
            onChange={(value) => {
              setActiveTab(value as OrderTab)
            }}
          />
        </button>
      </div>

      <div className="">{renderTabContent()}</div>
    </div>
  )
}

export default PlaceOrder
