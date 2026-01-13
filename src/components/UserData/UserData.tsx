'use client'
import useIsSpot from '@/hooks/useIsSpot'
import { useEffect, useMemo, useState } from 'react'
import Balances from './Balances'
import Positions from './Positions'
import OpenOrders from './OpenOrders'
import OrderHistory from './OrderHistory'
import TradeHistory from './TradeHistory'
import DepositsWithdrawals from './DepositsWithdrawals'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import useUserStore from '@/store/userStore'
import { cn } from '@/lib/utils'
import { useTranslate } from '@tolgee/react'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { IconCheckbox, IconSquare } from '@tabler/icons-react'
import { useScreenSize } from '@/hooks/useScreenSize'

const UserData = () => {
  const { t } = useTranslate()
  const { clearingHouseState, openOrders, spotState } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState,
      openOrders: state.openOrders,
      spotState: state.spotState
    }))
  )
  const isSpot = useIsSpot()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
  const { spotKeyToName } = useSpotMeta()
  const { isMobile } = useScreenSize()
  const [isHideSmallBalances, setIsHideSmallBalances] = useState(false)

  const positionsCount = useMemo(() => {
    return clearingHouseState?.assetPositions?.length || 0
  }, [clearingHouseState?.assetPositions])

  const balanceCount = useMemo(() => {
    const baseCount =
      spotState?.balances?.filter((balance) => Number(balance.total) > 0)?.length || 0
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
        element: <Balances isRTL={isRTL} isHideSmallBalances={isHideSmallBalances} />
      },
      {
        header: isRTL
          ? `(${positionsCount}) ${t('Positions')}`
          : `(${positionsCount}) ${t('Positions')}`,
        count: positionsCount,
        element: <Positions isRTL={isRTL} />
      },
      {
        header: isRTL
          ? `(${openOrdersLength}) ${t('Open Orders')}`
          : `(${openOrdersLength}) ${t('Open Orders')}`,
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
      },
      {
        header: t('Deposits and Withdrawals'),
        element: <DepositsWithdrawals isRTL={isRTL} />
      }
    ]
    return isRTL ? tabs.reverse() : tabs
  }, [isSpot, positionsCount, openOrders.length, balanceCount, isRTL, t, isHideSmallBalances])

  const [activeTab, setActiveTab] = useState<number>(isSpot ? 0 : 1) // default to positions for perps and balances for spot

  useEffect(() => {
    setActiveTab((activeTab) => tabs.length - 1 - activeTab)
  }, [isRTL])

  return (
    <div
      className={cn(
        'w-full bg-secondary h-full rounded-md overflow-x-hidden flex flex-col gap-1 p-2',
        isRTL ? 'items-end' : ''
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-2 w-full',
          isRTL && 'flex-row-reverse'
        )}
      >
        <div
          className={cn(
            'md:max-w-xl xl:max-w-3xl w-full h-7 flex shrink-0 items-center overflow-x-auto no-scrollbar justify-start',
            isRTL && 'flex-row-reverse'
          )}
        >
          <ToggleGroup
            type="single"
            className="w-fit h-full rounded-md"
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
                className="!text-xs xl:!text-sm w-auto min-w-fit h-full !px-2 whitespace-nowrap data-[state=on]:bg-transparent data-[state=on]:text-primary"
                value={index.toString()}
              >
                {tab.header}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        {(isRTL ? activeTab === tabs.length - 1 : activeTab === 0 && !isMobile) && (
          <Toggle
            className={cn(
              'flex items-center data-[state=on]:bg-transparent h-fit w-fit p-2 text-white/70 gap-2',
              isRTL && 'flex-row-reverse'
            )}
            pressed={isHideSmallBalances}
            onPressedChange={(value) => setIsHideSmallBalances(value)}
          >
            <p className={cn('text-xs', isHideSmallBalances && 'text-accent-foreground')}>
              {t('Hide Small Balances')}
            </p>
            {isHideSmallBalances ? (
              <IconCheckbox className="size-4" />
            ) : (
              <IconSquare className="size-4" />
            )}
          </Toggle>
        )}
      </div>
      <Separator orientation="horizontal" />
      <div className="w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar">
        {tabs[activeTab] && <div className="w-full h-full">{tabs[activeTab].element}</div>}
      </div>
    </div>
  )
}

export default UserData
