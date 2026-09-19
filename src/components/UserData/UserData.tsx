'use client'
import useIsSpot from '@/hooks/useIsSpot'
import { useEffect, useMemo, useState } from 'react'
import Balances from './Balances'
import Positions from './Positions'
import OpenOrders from './OpenOrders'
import OrderHistory from './OrderHistory'
import TradeHistory from './TradeHistory'
import TwapOrders from './TwapOrders'
import DepositsWithdrawals from './DepositsWithdrawals'
import { useHyperliquidStore, useIsUnified } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { IconCheckbox, IconSquare } from '@tabler/icons-react'
import { useScreenSize } from '@/hooks/useScreenSize'
import { usePathname } from 'next/navigation'

const UserData = () => {
  const pathname = usePathname()
  const { clearingHouseState, openOrders, spotState, twapStates } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState,
      openOrders: state.openOrders,
      spotState: state.spotState,
      twapStates: state.twapStates
    }))
  )
  const isSpot = useIsSpot()
  const isUnified = useIsUnified()
  const isPortfolio = pathname?.startsWith('/portfolio')
  const isRTL = false
  const { spotKeyToName } = useSpotMeta()
  const { isMobile } = useScreenSize()
  const [isHideSmallBalances, setIsHideSmallBalances] = useState(false)

  const positionsCount = useMemo(() => {
    return clearingHouseState?.assetPositions?.length || 0
  }, [clearingHouseState?.assetPositions])

  const balanceCount = useMemo(() => {
    const baseCount =
      spotState?.balances?.filter((balance) => Number(balance.total) > 0)?.length || 0
    // Under unified/portfolio-margin Balances.tsx doesn't render a synthetic
    // USDC(Perps) row, so don't inflate the count for it.
    if (isUnified) return baseCount
    const perpsAccountValue = Number(clearingHouseState?.marginSummary?.accountValue || 0)
    const hasPerpsUsdc = perpsAccountValue > 0
    return baseCount + (hasPerpsUsdc ? 1 : 0)
  }, [spotState?.balances, clearingHouseState?.marginSummary?.accountValue, isUnified])

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
        header: isRTL ? `(${balanceCount}) ${'Balances'}` : `(${balanceCount}) ${'Balances'}`,
        count: balanceCount,
        element: <Balances isRTL={isRTL} isHideSmallBalances={isHideSmallBalances} />
      },
      // BUG-026: Positions tab is a perps-only concept. Spot has no positions,
      // only balances — hide the tab entirely on spot.
      ...(isSpot
        ? []
        : [
            {
              header: isRTL
                ? `(${positionsCount}) ${'Positions'}`
                : `(${positionsCount}) ${'Positions'}`,
              count: positionsCount,
              element: <Positions isRTL={isRTL} />
            }
          ]),
      {
        header: isRTL
          ? `(${openOrdersLength}) ${'Open Orders'}`
          : `(${openOrdersLength}) ${'Open Orders'}`,
        count: openOrdersLength,
        element: <OpenOrders isRTL={isRTL} />
      },
      {
        header: twapStates.length > 0 ? `(${twapStates.length}) TWAP` : 'TWAP',
        count: twapStates.length,
        element: <TwapOrders isRTL={isRTL} />
      },
      {
        header: 'Trade History',
        element: <TradeHistory isRTL={isRTL} />
      },
      {
        header: 'Orders History',
        element: <OrderHistory isRTL={isRTL} />
      },
      {
        header: 'Deposits and Withdrawals',
        element: <DepositsWithdrawals isRTL={isRTL} />
      }
    ]
    return isRTL ? tabs.reverse() : tabs
  }, [
    isSpot,
    positionsCount,
    openOrders.length,
    balanceCount,
    isRTL,
    isHideSmallBalances,
    twapStates.length
  ])

  // Default tab: Balances for spot/portfolio, Positions for futures/perps.
  // In RTL the tabs array is reversed, so indices are mirrored.
  // Note: spot has 6 tabs (no Positions), perps has 7 — TWAP tab was added
  // between Open Orders and Trade History to mirror Hyperliquid.
  const defaultTab = useMemo(() => {
    const tabsLength = isSpot ? 6 : 7
    if (isSpot || isPortfolio) {
      // Balances: index 0 in LTR, last index in RTL
      return isRTL ? tabsLength - 1 : 0
    } else {
      // Positions: index 1 in LTR, second-to-last in RTL
      return isRTL ? tabsLength - 2 : 1
    }
  }, [isSpot, isPortfolio, isRTL])

  const [activeTab, setActiveTab] = useState<number>(defaultTab)

  // Reset to default tab when pathname changes or RTL mode changes
  useEffect(() => {
    setActiveTab(defaultTab)
  }, [pathname, defaultTab])

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
            'md:max-w-xl xl:max-w-3xl w-full h-8 flex shrink-0 items-center overflow-x-auto no-scrollbar justify-start',
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
                className="!text-xs w-auto min-w-fit h-full !px-4 whitespace-nowrap data-[state=on]:bg-transparent data-[state=on]:text-primary"
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
              isRTL && 'flex-row-reverse',
              isMobile && 'hidden'
            )}
            pressed={isHideSmallBalances}
            onPressedChange={(value) => setIsHideSmallBalances(value)}
          >
            <p className={cn('text-xs', isHideSmallBalances && 'text-accent-foreground')}>
              {isHideSmallBalances ? 'Show All Balances' : 'Hide Small Balances'}
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
