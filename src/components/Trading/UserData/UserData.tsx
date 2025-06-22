import useIsSpot from '@/hooks/useIsSpot'
import { useMemo, useState } from 'react'
import Balances from './Balances'
import Positions from './Positions'
import OpenOrders from './OpenOrders'
import OrderHistory from './OrderHistory'
import TradeHistory from './TradeHistory'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { useSpotMeta } from '@/hooks/useSpotMeta'

const UserData = () => {
  const { clearingHouseState, openOrders } = useHyperliquid()
  const isSpot = useIsSpot()
  const { spotKeyToName } = useSpotMeta()

  const positionsCount = useMemo(() => {
    return clearingHouseState?.assetPositions?.length || 0
  }, [clearingHouseState?.assetPositions])

  const tabs = useMemo(() => {
    const openOrdersLength = openOrders.filter(order => {
      if (isSpot) {
        return !!spotKeyToName.get(order.coin)
      } else {
        // asset should not be in spot universe to be a perp order
        return !spotKeyToName.get(order.coin)
      }
    }).length
    const tabs = [
      {
        header: 'Balances',
        element: <Balances />
      },
      {
        header: `Open Orders`,
        count: openOrdersLength,
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
        header: `Positions `,
        count: positionsCount,
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
    <div className="w-full h-full">
      <div className="flex justify-between items-center border-white/10 border-b w-full">
        <nav className="flex">
          {tabs?.map((tab, index) => (
            <button
              key={tab.header}
              onClick={() => setActiveTab(index)}
              className={`tab-btn xl:px-6 px-4  text-xs font-normal whitespace-nowrap flex items-center gap-x-2 ${
                activeTab === index ? 'tab-btn-active' : 'border-transparent text-[#8B8BA0]'
              }`}
            >
              {tab.header}
              {tab.count && Number(tab.count) > 0 ? (
                <p className="flex justify-center items-center bg-primary rounded-full w-4 h-4 aspect-square text-white text-xs">
                  {tab.count}
                </p>
              ) : null}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-3 mb-6 w-full">
        {tabs[activeTab] && <div>{tabs[activeTab].element}</div>}
      </div>
    </div>
  )
}

export default UserData
