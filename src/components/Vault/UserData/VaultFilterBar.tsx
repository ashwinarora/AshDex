'use client'
import { FC } from 'react'
import Image from 'next/image'
import searchnormalicon from '@/assets/images/search-normal.svg'

interface VaultFilterBarProps {
  shouldShowVaultTabs: boolean
  selectedTab: string
  vaultTabs: readonly string[]
  onSelectTab: (tab: string) => void
  searchValue: string
  onSearchChange: (value: string) => void
}

const VaultFilterBar: FC<VaultFilterBarProps> = ({
  shouldShowVaultTabs,
  selectedTab,
  onSelectTab,
  searchValue,
  vaultTabs,
  onSearchChange
}) => {
  return (
    <div className="mt-5 max-lg:items-start max-lg:gap-y-3 sm:px-3 px-1 flex flex-row max-lg:flex-col justify-between items-center gap-1 w-full">
      <div className="flex flex-wrap items-center gap-x-2 text-sm text-white">
        {vaultTabs?.map((item) => (
          <button
            key={item}
            onClick={() => onSelectTab(item)}
            className={`${shouldShowVaultTabs ? 'px-4 max-lg:px-2.5' : 'px-2.5'} py-1.5 cursor-pointer rounded-full transition-all duration-150 ${
              selectedTab === item
                ? 'bg-[#FFFFFF1A] text-white font-semibold'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      {shouldShowVaultTabs && (
        <div className="relative max-lg:w-full w-[20%]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Image src={searchnormalicon} alt="search" style={{ width: 18, height: 'auto' }} />
          </div>
          <input
            type="text"
            placeholder="e.g. “BTC” or “Bitcoin”"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#FFFFFF0F] text-sm placeholder:text-[#8B8BA0] text-white pl-10 pr-4 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 transition-all duration-150"
          />
        </div>
      )}
    </div>
  )
}

export default VaultFilterBar
