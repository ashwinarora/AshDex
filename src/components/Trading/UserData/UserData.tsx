'use client'

import { useState } from 'react'
import Balances from './Balances'
import Positions from './Positions'
import OpenOrders from './OpenOrders'

const tabs = [
  'Balances',
  'Positions(5)',
  'Open Orders(102)',
  'TWAP',
  'Trade History',
  'Orders History',
  'Funding History'
] as const

const UserData = () => {
  const [activeTab, setActiveTab] = useState(1)

  return (
    <div className="w-full">
      <div className="border-b border-white/10">
        <nav className="flex flex-wrap max-[770px]:gap-x-2 gap-x-6 px-3 -mb-px overflow-x-auto">
          {tabs?.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`py-3 px-1 font-medium text-center text-base border-b-3 cursor-pointer whitespace-nowrap ${
                activeTab === index
                  ? 'border-[#5F46F9] text-[#FFFFFF] rounded-xs'
                  : 'border-transparent text-[#8B8BA0]'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-3 mb-6 w-full">
        {activeTab === 0 && (
          <div>
            <Balances />
          </div>
        )}
        {activeTab === 1 && (
          <div>
            <Positions />
          </div>
        )}
        {activeTab === 2 && (
          <div>
            <OpenOrders />
          </div>
        )}
      </div>
    </div>
  )
}

export default UserData
