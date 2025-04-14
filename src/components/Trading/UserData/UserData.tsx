'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { Order } from '@/utils/hyperliquid/hyperLiquidTypes'
import Balances from './Balances'
import Positions from './Positions'
import OpenOrders from './OpenOrders'
import Twap from './Twap'
import TradeHistory from './TradeHistory'
import FundingHistory from './FundingHistory'
import Depositors from './Depositors'
import DepositsAndWithdrawals from './DepositsAndWithdrawals'
import OrdersHistory from './OrdersHistory'
import CustomSelector from '../PlaceOrderBox/CustomSelector'

const UserData = () => {
  const pathname = usePathname()
  const { address } = useAccount()
  const { clearingHouseState } = useHyperLiquid()
  const { data: openOrders } = useQuery<Order[]>({
    queryKey: ['openOrders', address],
    queryFn: async () => {
      return []
    },
    enabled: !!address,
    initialData: []
  })
  const isSpot = pathname.includes('/spot')
  const positionsCount = clearingHouseState?.assetPositions?.length || 0
  const tabs = [
    'Balances',
    ...(pathname !== '/spot'
      ? [`Positions ${positionsCount > 0 ? ' (' + positionsCount + ')' : ''}`]
      : []),
    `Open Orders (${openOrders?.length})`,
    'TWAP',
    'Trade History',
    'Orders History',
    'Funding History'
  ] as const

  const [activeTab, setActiveTab] = useState<number>(1)
  const tabOptions = tabs.map((label, index) => ({
    value: index.toString(),
    label
  }))

  return (
    <div className="w-full">
      <div className="border-b w-full flex justify-between items-center border-white/10">
        <nav className="hidden lg:flex flex-wrap max-[770px]:gap-x-2 gap-x-6 px-3 -mb-px overflow-x-auto">
          {tabs?.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`py-3 px-1 font-medium text-center text-base border-b-3 cursor-pointer whitespace-nowrap ${
                activeTab === index
                  ? 'border-primary text-[#FFFFFF] rounded-xs'
                  : 'border-transparent text-[#8B8BA0]'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="lg:hidden w-full">
          <CustomSelector
            options={tabOptions}
            selectedValue={activeTab?.toString()}
            onChange={(value) => {
              setActiveTab(Number(value))
            }}
          />
        </div>
      </div>
      <div className="mt-3 mb-6 w-full">
        {activeTab === 0 && <Balances />}
        {pathname !== '/spot' && activeTab === 1 && <Positions />}
        {activeTab === (isSpot ? 1 : 2) && <OpenOrders />}
        {activeTab === (isSpot ? 2 : 3) && <Twap />}
        {activeTab === (isSpot ? 3 : 4) && <TradeHistory />}
        {activeTab === (isSpot ? 4 : 5) && <OrdersHistory />}
        {activeTab === (isSpot ? 5 : 6) && <FundingHistory />}
        {activeTab === (isSpot ? 6 : 7) && <DepositsAndWithdrawals />}
        {activeTab === (isSpot ? 7 : 8) && <Depositors />}
      </div>
    </div>
  )
}

export default UserData
