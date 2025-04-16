import React, { useState } from 'react'
import ReferralsTable from './ReferralsTable'
import LegacyRewardHistory from './LegacyRewardHistory'

const ReferralsTablesTab = () => {
  const [activeTab, setActiveTab] = useState<number>(0)
  const tabs = ['Referrals', 'Legacy reward history'] as const
  return (
    <div className="border-2 border-white/10 rounded-xl">
      <div className="w-full">
        <div className="border-b w-full border-white/10">
          <nav className="border-b border-white/10 flex flex-wrap gap-x-6 px-3 -mb-px overflow-x-auto">
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
          <div className="mt-3 mb-6 w-full">
            {activeTab === 0 && <ReferralsTable />}
            {activeTab === 1 && <LegacyRewardHistory />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReferralsTablesTab
