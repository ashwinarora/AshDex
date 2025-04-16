import React, { useState } from 'react'
import { REFERRALS_TABLES_TABS } from '@/utils/constants'
import ReferralsTable from './ReferralsTable'
import LegacyRewardHistory from './LegacyRewardHistory'

const ReferralsTablesTab = () => {
  const [activeTab, setActiveTab] = useState<number>(0)

  return (
    <div className="border-2 w-full border-white/10 rounded-xl">
      <nav className="border-b border-white/10 flex flex-wrap gap-x-6 px-3 -mb-px overflow-x-auto">
        {REFERRALS_TABLES_TABS?.map((tab, index) => (
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
      <div className="mt-3 mb-1 w-full">
        {activeTab === 0 && <ReferralsTable />}
        {activeTab === 1 && <LegacyRewardHistory />}
      </div>
    </div>
  )
}

export default ReferralsTablesTab
