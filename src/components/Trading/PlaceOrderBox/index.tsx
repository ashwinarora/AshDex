'use client'
import { useState } from 'react'
import LimitOrder from './LimitOrder'
import MarketOrder from './MarketOrder'
import TWAP from './TWAP'
import Scale from './Scale'
import CustomSelector from '../../common/CustomSelector'
import StopLimit from './StopLimit'
import StopMarket from './StopMarket'

/** Define the possible tab options */
type OrderTab = 'LIMIT' | 'MARKET' | 'TWAP' | 'SCALE' | 'STOP_LIMIT' | 'STOP_MARKET'

export interface IPlaceOrderProps {
  selectedAsset: string
}

const PlaceOrder = ({ selectedAsset }: IPlaceOrderProps) => {
  const [activeTab, setActiveTab] = useState<OrderTab>('LIMIT')

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

  return (
    <div>
      <div className="flex border-b border-white/10 p-3 mb-2.5 items-center justify-evenly space-x-2  ">
        <button
          onClick={() => setActiveTab('LIMIT')}
          className={`tab-btn ${activeTab === 'LIMIT' && 'tab-btn-active'}`}
        >
          Limit
        </button>

        <button
          onClick={() => setActiveTab('MARKET')}
          className={`tab-btn ${activeTab === 'MARKET' && 'tab-btn-active'}`}
        >
          Market
        </button>

        <button
          className={`tab-btn ${
            activeTab === 'TWAP' || (activeTab === 'SCALE' && 'tab-btn-active')
          }`}
        >
          <CustomSelector
            options={[
              { value: 'TWAP', label: 'TWAP' },
              { value: 'SCALE', label: 'SCALE' },
              { value: 'STOP_LIMIT', label: 'Stop Limit' },
              { value: 'STOP_MARKET', label: 'Stop Market' }
            ]}
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
