'use client'
import useIsSpot from '@/hooks/useIsSpot'
import { useEffect, useMemo, useState } from 'react'
import Balances from './Balances'
import Positions from './Positions'
import OpenOrders from './OpenOrders'
import OrderHistory from './OrderHistory'
import TradeHistory from './TradeHistory'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import useUserStore from '@/store/userStore'
import { cn } from '@/lib/utils'
import { useTranslate } from '@tolgee/react'

interface IUserDataProps {
  setSelectedAsset?: (asset: string) => void
}

const UserData = ({ setSelectedAsset }: IUserDataProps) => {
  const { t } = useTranslate()
  const { clearingHouseState, openOrders, spotState } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState,
      openOrders: state.openOrders,
      spotState: state.spotState
    }))
  )
  const isSpot = useIsSpot()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar')
  const { spotKeyToName } = useSpotMeta()

  const positionsCount = useMemo(() => {
    return clearingHouseState?.assetPositions?.length || 0
  }, [clearingHouseState?.assetPositions])

  const balanceCount = useMemo(() => {
    const baseCount = spotState?.balances?.length || 0
    const perpsAccountValue = Number(clearingHouseState?.marginSummary?.accountValue || 0)
    const hasPerpsUsdc = perpsAccountValue > 0
    return baseCount + (hasPerpsUsdc ? 1 : 0)
  }, [spotState?.balances, clearingHouseState?.marginSummary?.accountValue])

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
        header: isRTL ? `(${balanceCount}) ${t('Balances')}` : `(${balanceCount}) ${t('Balances')}`,
        count: balanceCount,
        element: <Balances setSelectedAsset={setSelectedAsset || (() => {})} isRTL={isRTL} />
      },
      {
        header: isRTL ? `(${positionsCount}) ${t('Positions')}` : `(${positionsCount}) ${t('Positions')}`,
        count: positionsCount,
        element: <Positions isRTL={isRTL} setSelectedAsset={setSelectedAsset || (() => {})} />
      },
      {
        header: isRTL ? `(${openOrdersLength}) ${t('Open Orders')}` : `(${openOrdersLength}) ${t('Open Orders')}`,
        count: openOrdersLength,
        element: <OpenOrders isRTL={isRTL} />
      },
      {
        header: t('Trade History'),
        element: <TradeHistory isRTL={isRTL} />
      },
      {
        header: t('Orders History'),
        element: <OrderHistory isRTL={isRTL} />
      }
    ]
    return isRTL ? tabs.reverse() : tabs
  }, [isSpot, positionsCount, openOrders.length, balanceCount, isRTL, t])

  const [activeTab, setActiveTab] = useState<number>(isSpot ? 0 : 1) // default to positions for perps and balances for spot

  useEffect(() => {
    setActiveTab((activeTab) => tabs.length - 1 - activeTab)
  }, [isRTL])

  return (
    <div
      className={cn(
        'w-full bg-secondary h-full rounded-md overflow-x-hidden flex flex-col gap-2 p-2',
        isRTL ? 'items-end' : ''
      )}
    >
      <div
        className={cn(
          'md:max-w-xl xl:max-w-3xl w-full h-10 flex shrink-0 items-center overflow-x-auto no-scrollbar justify-start',
          isRTL ? 'flex-row-reverse' : ''
        )}
      >
        <ToggleGroup
          type="single"
          className="w-fit h-full bg-white/5 rounded-md"
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
              className="!text-xs xl:!text-sm w-28 md:w-28 xl:w-36 h-full !px-2 first:rounded-l-md last:rounded-r-md"
              value={index.toString()}
            >
              {tab.header}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar">
        {tabs[activeTab] && <div className="w-full h-full">{tabs[activeTab].element}</div>}
      </div>
    </div>
  )
}

export default UserData
