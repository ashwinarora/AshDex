'use client'

import { useState } from 'react'
import Balances from './Balances'
import Positions from './Positions'
import OpenOrders from './OpenOrders'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { Order } from '@/utils/hyperLiquidTypes'

const UserData = () => {
  const { address } = useAccount()
  const [activeTab, setActiveTab] = useState(1)
  const { clearingHouseState } = useHyperLiquid()
  const { data: openOrders } = useQuery<Order[]>({
    queryKey: ['openOrders', address],
    enabled: false,
    initialData: []
  })

  const positionsCount = clearingHouseState?.assetPositions?.length || 0
  const tabs = [
    'Balances',
    `Positions ${positionsCount > 0 ? ' (' + positionsCount + ')' : ''}`,
    `Open Orders (${openOrders.length})`,
    'TWAP',
    'Trade History',
    'Orders History',
    'Funding History'
  ] as const

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
        <div className={activeTab === 0 ? '' : 'hidden'}>
          <Balances />
        </div>
        <div className={activeTab === 1 ? '' : 'hidden'}>
          <Positions />
        </div>
        <div className={activeTab === 2 ? '' : 'hidden'}>
          <OpenOrders />
        </div>
      </div>
    </div>
  )
}

export default UserData
