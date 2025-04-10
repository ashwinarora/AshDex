import { useHyperLiquid } from '@/context/HyperLiquid'
import useIsSpot from '@/hooks/useIsSpot'
import { Order } from '@/utils/hyperliquid/hyperLiquidTypes'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import Balances from './Balances'
import Positions from './Positions'
import OpenOrders from './OpenOrders'

const UserData = () => {
  const { address } = useAccount()
  const { clearingHouseState } = useHyperLiquid()
  const isSpot = useIsSpot()
  const { data: openOrders } = useQuery<Order[]>({
    queryKey: ['openOrders', address],
    queryFn: async () => {
      return []
    },
    enabled: !!address,
    initialData: []
  })

  const positionsCount = clearingHouseState?.assetPositions?.length || 0

  const tabs = useMemo(() => {
    const tabs = [
      {
        header: 'Balances',
        element: <Balances />
      },
      {
        header: `Open Orders (${openOrders?.length})`,
        element: <OpenOrders />
      },
      {
        header: 'TWAP',
        element: null
      },
      {
        header: 'Trade History',
        element: null
      },
      {
        header: 'Orders History',
        element: null
      },
      {
        header: 'Funding History',
        element: null
      }
    ]
    if (!isSpot) {
      tabs.splice(2, 0, {
        header: `Positions (${positionsCount})`,
        element: <Positions />
      })
    }
    return tabs
  }, [isSpot, positionsCount, openOrders?.length])

  const [activeTab, setActiveTab] = useState<number>(0)

  return (
    <div className="w-full">
      <div className="border-b border-white/10">
        <nav className="flex flex-wrap max-[770px]:gap-x-2 gap-x-6 px-3 -mb-px overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={tab.header}
              onClick={() => setActiveTab(index)}
              className={`py-3 px-1 font-medium text-center text-base border-b-3 cursor-pointer whitespace-nowrap ${
                activeTab === index
                  ? 'border-[#5F46F9] text-[#FFFFFF] rounded-xs'
                  : 'border-transparent text-[#8B8BA0]'
              }`}
            >
              {tab.header}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-3 mb-6 w-full">
        {tabs.map((tab, index) => (
          <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
            {tab.element}
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserData
