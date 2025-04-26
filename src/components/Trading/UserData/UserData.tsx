import { useHyperLiquid } from '@/context/HyperLiquid'
import useIsSpot from '@/hooks/useIsSpot'
import { useMemo, useState } from 'react'
import Balances from './Balances'
import Positions from './Positions'
import OpenOrders from './OpenOrders'
import OrderHistory from './OrderHistory'
import TradeHistory from './TradeHistory'

const UserData = () => {
  const { clearingHouseState, openOrders } = useHyperLiquid()
  const isSpot = useIsSpot()

  const positionsCount = useMemo(() => {
    return clearingHouseState?.assetPositions?.length || 0
  }, [clearingHouseState?.assetPositions])

  const tabs = useMemo(() => {
    const openOrdersLength = openOrders.filter((o) =>
      o.coin.includes(isSpot ? 'SPOT' : 'PERP')
    ).length
    const tabs = [
      {
        header: 'Balances',
        element: <Balances />
      },
      {
        header: `Open Orders (${openOrdersLength})`,
        element: <OpenOrders />
      },
      {
        header: 'Trade History',
        element: <TradeHistory />
      },
      {
        header: 'Orders History',
        element: <OrderHistory />
      }
    ]
    if (!isSpot) {
      tabs.splice(1, 0, {
        header: `Positions (${positionsCount})`,
        element: <Positions />
      })
      tabs.push({
        header: 'Funding History',
        element: <></>
      })
    }
    return tabs
  }, [isSpot, positionsCount, openOrders.length])

  const [activeTab, setActiveTab] = useState<number>(0)

  return (
    <div className="w-full">
      <div className="border-b w-full flex justify-between items-center border-white/10">
        <nav className="flex flex-wrap max-[770px]:gap-x-2 gap-x-6 px-3 -mb-px overflow-x-auto">
          {tabs?.map((tab, index) => (
            <button
              key={tab.header}
              onClick={() => setActiveTab(index)}
              className={`py-3 px-1 font-medium text-center text-base border-b-3 cursor-pointer whitespace-nowrap ${
                activeTab === index
                  ? 'border-primary text-white rounded-xs'
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
