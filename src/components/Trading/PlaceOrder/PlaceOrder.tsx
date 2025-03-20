'use client'
import { useState } from 'react'
import LimitOrder from './LimitOrder'

/** Define the possible tab options */
type OrderTab = 'LIMIT' | 'MARKET' | 'STOP_LIMIT'

interface IPlaceOrderProps {
  selectedAsset: string
}

const PlaceOrder = ({ selectedAsset }: IPlaceOrderProps) => {
  const [activeTab, setActiveTab] = useState<OrderTab>('LIMIT')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'LIMIT':
        return <LimitOrder selectedAsset={selectedAsset} />
      case 'MARKET':
        return <MarketComponent />
      case 'STOP_LIMIT':
        return <StopLimitComponent />
      default:
        return null
    }
  }

  return (
    <div>
      <div className="flex items-center justify-evenly space-x-2 p-2 rounded-xl">
        <button
          onClick={() => setActiveTab('LIMIT')}
          className={`w-full  py-2 rounded-full transition-colors duration-200 ${
            activeTab === 'LIMIT' ? 'bg-[#FFFFFF0F] text-white' : ' text-[#8B8BA0]'
          }`}
        >
          Limit
        </button>

        <button
          onClick={() => setActiveTab('MARKET')}
          className={`w-full  py-2 rounded transition-colors duration-200 ${
            activeTab === 'MARKET' ? 'bg-blue-600 text-white' : ' text-[#8B8BA0]'
          }`}
        >
          Market
        </button>

        <select className="py-2 rounded text-[#8B8BA0] bg-transparent outline-none ring-0 focus:ring-0 focus:outline-none">
          <option value="STOP_LIMIT">Advanced</option>
          <option value="LIMIT">Limit</option>
          <option value="MARKET">Market</option>
        </select>
      </div>

      <div className="">{renderTabContent()}</div>
    </div>
  )
}
// ETH
const MarketComponent: React.FC = () => (
  <div className="p-4 border border-gray-700 rounded-md bg-gray-800">
    <h2 className="font-semibold text-lg">Market Order</h2>
    <p className="text-gray-300">Content for Market order goes here.</p>
  </div>
)

const StopLimitComponent: React.FC = () => (
  <div className="p-4 border border-gray-700 rounded-md bg-gray-800">
    <h2 className="font-semibold text-lg">Stop Limit Order</h2>
    <p className="text-gray-300">Content for Stop Limit order goes here.</p>
  </div>
)

export default PlaceOrder
