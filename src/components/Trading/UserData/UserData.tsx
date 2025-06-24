import useIsSpot from '@/hooks/useIsSpot'
import { useMemo, useState } from 'react'
import Balances from './Balances'
import Positions from './Positions'
import OpenOrders from './OpenOrders'
import OrderHistory from './OrderHistory'
import TradeHistory from './TradeHistory'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface IUserDataProps {
  setSelectedAsset: (asset: string) => void
}

const UserData = ({ setSelectedAsset }: IUserDataProps) => {
  const { clearingHouseState, openOrders } = useHyperliquid()
  const isSpot = useIsSpot()
  const { spotKeyToName } = useSpotMeta()

  const positionsCount = useMemo(() => {
    return clearingHouseState?.assetPositions?.length || 0
  }, [clearingHouseState?.assetPositions])

  const tabs = useMemo(() => {
    const openOrdersLength = openOrders.filter((order) => {
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
        element: <Positions setSelectedAsset={setSelectedAsset} />
      })
      // tabs.push({
      //   header: 'Funding History',
      //   element: <></>
      // })
    }
    return tabs
  }, [isSpot, positionsCount, openOrders.length])

  const [activeTab, setActiveTab] = useState<number>(isSpot ? 0 : 1) // default to positions for perps and balances for spot

  return (
    <div className="w-full h-full rounded-md flex flex-col gap-2 p-2">
      <div className="w-full h-fit flex items-center justify-start">
        <ToggleGroup
          type="single"
          className="w-full bg-white/5 rounded-md"
          value={activeTab.toString()}
          onValueChange={(value) => {
            if (value === '') {
              return
            }
            setActiveTab(Number(value))
          }}
        >
          {tabs.map((tab, index) => (
            <ToggleGroupItem
              key={tab.header}
              className="w-full first:rounded-l-md last:rounded-r-md"
              value={index.toString()}
            >
              {tab.header}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="w-full h-full rounded-md overflow-y-auto no-scrollbar">
        {tabs[activeTab] && <div>{tabs[activeTab].element}</div>}
      </div>
    </div>
  )
}

export default UserData
