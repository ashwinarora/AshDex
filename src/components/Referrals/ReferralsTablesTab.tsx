import React, { useState } from 'react'
import { REFERRALS_TABLES_TABS } from '@/utils/constants'
import ReferralsTable from './ReferralsTable'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/userStore'
import { useTranslate } from '@tolgee/react'

const ReferralsTablesTab = () => {
  const [activeTab, setActiveTab] = useState<(typeof REFERRALS_TABLES_TABS)[number]>('Referrals')
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
  const { t } = useTranslate()
  return (
    <div
      className={cn(
        'w-full h-full flex-1 flex flex-col p-2 gap-2 justify-start bg-secondary rounded-md shrink-0',
        isRTL && 'items-end'
      )}
    >
      <div
        className={cn(
          'md:max-w-xl xl:max-w-3xl w-full h-8 flex shrink-0 items-center overflow-x-auto no-scrollbar justify-start',
          isRTL && 'flex-row-reverse'
        )}
      >
        <ToggleGroup
          size="sm"
          type="single"
          className={cn('bg-secondary rounded-md w-full sm:w-fit', isRTL ? 'flex-row-reverse' : '')}
          value={activeTab}
          onValueChange={(value) => {
            if (value === '') {
              return
            }
            setActiveTab(value as (typeof REFERRALS_TABLES_TABS)[number])
          }}
        >
          {REFERRALS_TABLES_TABS.map((tab) => (
            <ToggleGroupItem
              key={tab}
              className={cn(
                'w-40 bg-white/5',
                isRTL
                  ? 'first:rounded-r-md last:rounded-l-md'
                  : 'first:rounded-l-md last:rounded-r-md'
              )}
              disabled={tab === 'Legacy reward history'}
              value={tab}
            >
              {t(tab)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="w-full h-full flex-1">{activeTab === 'Referrals' && <ReferralsTable />}</div>
    </div>
  )
}

export default ReferralsTablesTab

{
  /* <div className="w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Referral Analytics</h2>
          <p className="text-gray-400 text-sm">Track your referral performance and history</p>
        </div>
        <div className="mb-6">
          <nav className="flex space-x-1 bg-white/5 p-1 rounded-2xl">
            {REFERRALS_TABLES_TABS?.map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-6 font-semibold text-sm rounded-xl transition-all duration-300 ${activeTab === tab
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          {activeTab === 0 && <ReferralsTable />}
          {/* {activeTab === 1 &&
          (referralsDetails?.rewardHistory?.length > 0 ? (
            <LegacyRewardHistory rewardHistory={referralsDetails.rewardHistory} />
          ) : (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Reward History</h3>
                <p className="text-gray-400 text-sm">You don't have any rewards yet.</p>
              </div>
            </div>
          ))} 
        </div >
      </div > */
}
