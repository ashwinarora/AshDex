import React, { useState } from 'react'
import { REFERRALS_TABLES_TABS } from '@/utils/constants'
import ReferralsTable from './ReferralsTable'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/userStore'
import { useTranslate } from '@tolgee/react'
import LegacyRewardHistory from './LegacyRewardHistory'

const ReferralsTablesTab = () => {
  const [activeTab, setActiveTab] = useState<(typeof REFERRALS_TABLES_TABS)[number]>('Referrals')
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
  const { t } = useTranslate()
  return (
    <div
      className={cn(
        'w-full min-h-80 h-full flex-1 flex flex-col p-2 gap-2 justify-start bg-secondary rounded-md ',
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
                'w-40 bg-white/10',
                isRTL
                  ? 'first:rounded-r-md last:rounded-l-md'
                  : 'first:rounded-l-md last:rounded-r-md'
              )}
              value={tab}
            >
              {t(tab)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="w-full lg:h-full flex-1 overflow-y-auto no-scrollbar overflow-x-hidden">
        {activeTab === 'Referrals' && <ReferralsTable />}
        {activeTab === 'Reward history' && <LegacyRewardHistory />}
      </div>
    </div>
  )
}

export default ReferralsTablesTab
