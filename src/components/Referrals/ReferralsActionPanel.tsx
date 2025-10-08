'use client'
import React, { useMemo, useState } from 'react'
import { REFERRALSINFO_TAB } from '@/utils/constants'
import { useReferralsInfo } from '@/hooks/useReferralsInfo'
import ClaimInviteCode from '@/components/Referrals/ClaimInviteCode'
import CreateCode from '@/components/Referrals/CreateCode'
import Rewards from '@/components/Referrals/Rewards'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/userStore'
import { useTranslate } from '@tolgee/react'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { Separator } from '../ui/separator'

type ReferralsTab = (typeof REFERRALSINFO_TAB)[number]

function ReferralsActionPanel() {
  const { t } = useTranslate()
  const [activeTab, setActiveTab] = useState<ReferralsTab>('Enter Code')
  const { data: referralsDetails } = useReferralsInfo()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')

  const totalClaim = useMemo(() => {
    return (
      parseFloat(referralsDetails?.builderRewards || '0') +
      parseFloat(referralsDetails?.claimedRewards || '0')
    )
  }, [referralsDetails])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Enter Code':
        return <ClaimInviteCode />
      case 'Create Code':
        return <CreateCode />
      case 'Rewards':
        return <Rewards totalClaim={totalClaim} />
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col justify-start bg-secondary rounded-md w-96 shrink-0 h-96',
        isRTL && 'items-end'
      )}
    >
      <ToggleGroup
        type="single"
        className={cn(
          'w-full h-fit p-2 gap-4 flex items-center justify-start',
          isRTL
            ? 'rounded-l-none rounded-r-md flex-row-reverse'
            : 'rounded-l-md rounded-r-none flex-row'
        )}
        value={activeTab}
        onValueChange={(value) => {
          if (value === '') {
            return
          }
          setActiveTab(value as ReferralsTab)
        }}
      >
        <ToggleGroupItem
          className={cn(
            'w-full data-[state=on]:bg-transparent',
            isRTL ? 'rounded-r-md' : 'rounded-l-md'
          )}
          value="Enter Code"
        >
          {t('Enter Code')}
        </ToggleGroupItem>
        <ToggleGroupItem
          className={cn('w-full data-[state=on]:bg-transparent')}
          value="Create Code"
        >
          {t('Create Code')}
        </ToggleGroupItem>
        <ToggleGroupItem className={cn('w-full data-[state=on]:bg-transparent')} value="Rewards">
          {t('Rewards')}
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator className="w-full" orientation="horizontal" />
      <div className="w-full h-full p-2">{renderTabContent()}</div>
    </div>
  )
}

export default ReferralsActionPanel
