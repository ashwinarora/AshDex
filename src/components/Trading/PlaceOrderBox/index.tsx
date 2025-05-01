'use client'
import { useState } from 'react'
import LimitOrder from './LimitOrder'
import MarketOrder from './MarketOrder'
import TWAP from './TWAP'
import Scale from './Scale'
import CustomSelector from '../../common/CustomSelector'
import StopLimit from './StopLimit'
import StopMarket from './StopMarket'
import useIsSpot from '@/hooks/useIsSpot'
import ScaleSpot from './ScaleSpot'

/** Define the possible tab options */
type OrderTab = 'LIMIT' | 'MARKET' | 'TWAP' | 'SCALE' | 'STOP_LIMIT' | 'STOP_MARKET'

export interface IPlaceOrderProps {
  selectedAsset: string
}

const PlaceOrder = ({ selectedAsset }: IPlaceOrderProps) => {
  const [activeTab, setActiveTab] = useState<OrderTab>('LIMIT')
  const isSpot = useIsSpot()
  const isAdvancedTab = ['TWAP', 'SCALE', 'STOP_LIMIT', 'STOP_MARKET']?.includes(activeTab)
  const renderTabContent = () => {
    switch (activeTab) {
      case 'LIMIT':
        return <LimitOrder selectedAsset={selectedAsset} />
      case 'MARKET':
        return <MarketOrder selectedAsset={selectedAsset} />
      case 'TWAP':
        return <TWAP selectedAsset={selectedAsset} />
      case 'SCALE':
        return isSpot ? (
          <ScaleSpot selectedAsset={selectedAsset} />
        ) : (
          <Scale selectedAsset={selectedAsset} />
        )
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
    <div className="flex flex-col h-full">
      <div className="flex border-b border-white/10 p-2 mb-1 items-center justify-start w-full space-x-2">
        <div className={`flex space-x-2 ${isAdvancedTab ? '2xl:w-[45%] w-[70%]' : 'w-[70%]'}`}>
          <button
            onClick={() => setActiveTab('LIMIT')}
            className={`tab-btn flex-1 ${activeTab === 'LIMIT' && 'tab-btn-active'}`}
          >
            Limit
          </button>
          <button
            onClick={() => setActiveTab('MARKET')}
            className={`tab-btn flex-1 ${activeTab === 'MARKET' && 'tab-btn-active'}`}
          >
            Market
          </button>
        </div>
        <div className={`${isAdvancedTab ? '2xl:w-[55%] w-[30%]' : 'w-[30%]'}`}>
          <button
            className={`tab-btn w-full ${
              ['TWAP', 'SCALE', 'STOP_LIMIT', 'STOP_MARKET']?.includes(activeTab)
                ? 'tab-btn-active'
                : ''
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
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">{renderTabContent()}</div>
    </div>
  )
}
export default PlaceOrder
