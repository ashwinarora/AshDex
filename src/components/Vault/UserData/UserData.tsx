'use client'
import React, { useEffect, useState } from 'react'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { ORDER_INTERVALS, VAULTS_DETAILS_TAB } from '@/utils/constants'
import VaultFilterBar from '@/components/Vault/UserData/VaultFilterBar'
import Balances from '@/components/Vault/UserData/Balances'
import Positions from '@/components/Vault/UserData/Positions'
import OpenOrders from '@/components/Vault/UserData/OpenOrders'
import Twap from '@/components/Vault/UserData/Twap'
import TradeHistory from '@/components/Vault/UserData/TradeHistory'
import OrdersHistory from '@/components/Vault/UserData/OrdersHistory'
import FundingHistory from '@/components/Vault/UserData/FundingHistory'
import DepositsAndWithdrawals from '@/components/Vault/UserData/DepositsAndWithdrawals'
import Depositors from '@/components/Vault/UserData/Depositors'
import CustomSelector from '@/components/common/CustomSelector'

function UserData() {
  const { clearingHouseState, openOrders } = useHyperLiquid()
  const [searchValue, setSearchValue] = useState('')
  const [activeTab, setActiveTab] = useState<number>(0)
  const positionsCount = clearingHouseState?.assetPositions?.length || 0
  const tabs = [
    'Balances',
    `Positions ${positionsCount > 0 ? ' (' + positionsCount + ')' : ''}`,
    `Open Orders (${openOrders?.length})`,
    'TWAP',
    'Trade History',
    'Orders History',
    'Funding History',
    'Deposits and Withdrawals',
    'Depositors (100+)'
  ] as const

  const tabOptions = tabs?.map((label, index) => ({
    value: index?.toString(),
    label
  }))
  const showExportButton = activeTab === 4 || activeTab === 6 || activeTab === 7
  const shouldShowVaultTabs = activeTab === 0 || activeTab === 1
  const currentVaultTabs = shouldShowVaultTabs ? VAULTS_DETAILS_TAB : ORDER_INTERVALS
  const [selectedTab, setSelectedTab] = useState<(typeof currentVaultTabs)[number]>(
    shouldShowVaultTabs ? 'My Vaults' : '1s'
  )
  useEffect(() => {
    const defaultTab = shouldShowVaultTabs ? 'My Vaults' : '1s'
    setSelectedTab(defaultTab)
  }, [shouldShowVaultTabs])

  return (
    <div
      className="border-2 bg-[#1A0B35] mt-4 border-white/10 rounded-xl backdrop-blur-[40px]"
      style={{
        background:
          'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
      }}
    >
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
          {showExportButton && (
            <button className="bg-white/10 max-[770px]:hidden flex mx-2 my-1 px-6 py-2.5 cursor-pointer font-semibold rounded-xl text-sm">
              Export as CSV
            </button>
          )}
        </div>
        <VaultFilterBar
          shouldShowVaultTabs={shouldShowVaultTabs}
          vaultTabs={currentVaultTabs}
          selectedTab={selectedTab}
          onSelectTab={(tab: string) => setSelectedTab(tab as (typeof VAULTS_DETAILS_TAB)[number])}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />
        <div className="mt-3 mb-6 w-full">
          {activeTab === 0 && <Balances />}
          {activeTab === 1 && <Positions />}
          {activeTab === 2 && <OpenOrders />}
          {activeTab === 3 && <Twap />}
          {activeTab === 4 && <TradeHistory showExportButton={showExportButton} />}
          {activeTab === 5 && <OrdersHistory />}
          {activeTab === 6 && <FundingHistory showExportButton={showExportButton} />}
          {activeTab === 7 && <DepositsAndWithdrawals showExportButton={showExportButton} />}
          {activeTab === 8 && <Depositors />}
        </div>
      </div>
    </div>
  )
}

export default UserData
