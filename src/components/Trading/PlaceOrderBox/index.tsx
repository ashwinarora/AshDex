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
  const [activeTab, setActiveTab] = useState<OrderTab>('MARKET')
  const isSpot = useIsSpot()
  const renderTabContent = () => {
    switch (activeTab) {
      case 'LIMIT':
        return <LimitOrder selectedAsset={selectedAsset} />
      case 'MARKET':
        return <MarketOrder selectedAsset={selectedAsset} />
      case 'TWAP':
        return <TWAP />
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
    ? [{ value: 'SCALE', label: 'Scale' }]
    : [
        { value: 'SCALE', label: 'Scale' },
        { value: 'STOP_LIMIT', label: 'Stop Limit' },
        { value: 'STOP_MARKET', label: 'Stop Market' }
      ]

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex justify-start items-center mb-0.5 border-white/10 border-b w-full">
        <div className="flex space-x-2 w-full">
          <button
            onClick={() => setActiveTab('MARKET')}
            className={`tab-btn flex-1 text-sm ${activeTab === 'MARKET' && 'tab-btn-active'}`}
          >
            Market
          </button>
          <button
            onClick={() => setActiveTab('LIMIT')}
            className={`tab-btn flex-1 text-sm ${activeTab === 'LIMIT' && 'tab-btn-active'}`}
          >
            Limit
          </button>
          <button
            className={`tab-btn flex-1 text-sm ${
              ['TWAP', 'SCALE', 'STOP_LIMIT', 'STOP_MARKET']?.includes(activeTab)
                ? 'tab-btn-active'
                : ''
            }`}
          >
            <CustomSelector
              options={availableOptions}
              selectedValue={activeTab}
              customLabel="Advanced"
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
