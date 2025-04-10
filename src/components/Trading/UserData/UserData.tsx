'use client'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { Order } from '@/utils/hyperliquid/hyperLiquidTypes'
import { VAULTS_DETAILS_TAB, ORDER_INTERVALS } from '../../../utils/constants'
import Balances from './Balances'
import Positions from './Positions'
import OpenOrders from './OpenOrders'
import VaultFilterBar from '@/components/common/VaultFilterBar'
import Twap from './Twap'
import TradeHistory from './TradeHistory'
import FundingHistory from './FundingHistory'
import Depositors from './Depositors'
import DepositsAndWithdrawals from './DepositsAndWithdrawals'
import OrdersHistory from './OrdersHistory'

const UserData = () => {
  const pathname = usePathname()
  const { address } = useAccount()
  const isVaults = pathname.includes('/vaults')
  const { clearingHouseState } = useHyperLiquid()
  const { data: openOrders } = useQuery<Order[]>({
    queryKey: ['openOrders', address],
    queryFn: async () => {
      return []
    },
    enabled: !!address,
    initialData: []
  })
  const [searchValue, setSearchValue] = useState('')

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
    'Funding History',
    ...(isVaults ? ['Deposits and Withdrawals', 'Depositors (100+)'] : [])
  ] as const

  const getDefaultTab = useCallback(() => {
    if (pathname === '/spot') return 1
    if (isVaults) return 0
    return 1
  }, [pathname])

  const [activeTab, setActiveTab] = useState<number>(getDefaultTab)
  const shouldShowVaultTabs = isVaults && (activeTab === 0 || activeTab === 1)
  const shouldShowSpotOrdersFilter = pathname === '/spot' && activeTab === 1
  const currentVaultTabs = shouldShowVaultTabs ? VAULTS_DETAILS_TAB : ORDER_INTERVALS
  const [selectedTab, setSelectedTab] = useState<(typeof currentVaultTabs)[number]>(
    shouldShowVaultTabs ? 'My Vaults' : '1s'
  )

  useEffect(() => {
    const defaultTab = shouldShowVaultTabs ? 'My Vaults' : '1s'
    setSelectedTab(defaultTab)
  }, [shouldShowVaultTabs])

  useEffect(() => {
    setActiveTab(getDefaultTab)
  }, [pathname, getDefaultTab])

  return (
    <div className="w-full">
      <div className="border-b flex justify-between items-center border-white/10">
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
        {isVaults && (activeTab === 4 || activeTab === 6 || activeTab === 7) && (
          <button className="bg-white/10 mx-2 my-1 px-6 py-2.5 cursor-pointer font-semibold rounded-xl text-sm">
            Export as CSV
          </button>
        )}
      </div>
      {(isVaults || shouldShowSpotOrdersFilter) && (
        <VaultFilterBar
          shouldShowVaultTabs={shouldShowVaultTabs}
          vaultTabs={currentVaultTabs}
          selectedTab={selectedTab}
          onSelectTab={(tab: string) => setSelectedTab(tab as (typeof VAULTS_DETAILS_TAB)[number])}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />
      )}
      <div className="mt-3 mb-6 w-full">
        {activeTab === 0 && <Balances />}
        {pathname !== '/spot' && activeTab === 1 && <Positions />}
        {activeTab === (pathname === '/spot' ? 1 : 2) && <OpenOrders />}
        {activeTab === (pathname === '/spot' ? 2 : 3) && <Twap />}
        {activeTab === (pathname === '/spot' ? 3 : 4) && <TradeHistory />}
        {activeTab === (pathname === '/spot' ? 4 : 5) && <OrdersHistory />}
        {activeTab === (pathname === '/spot' ? 5 : 6) && <FundingHistory />}
        {activeTab === (pathname === '/spot' ? 6 : 7) && <DepositsAndWithdrawals />}
        {activeTab === (pathname === '/spot' ? 7 : 8) && <Depositors />}
      </div>
    </div>
  )
}

export default UserData
