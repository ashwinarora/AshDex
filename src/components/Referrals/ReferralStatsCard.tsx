import { cn } from '@/lib/utils'
import { useTranslate } from '@tolgee/react'
import useUserStore from '@/store/userStore'
import { useSuccessfulInvites } from '@/hooks/invite/useSuccessfulInvites'
import { useMemo } from 'react'

const ReferralStatsCard = () => {
  const { data: userInvites } = useSuccessfulInvites()
  const { t } = useTranslate()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')

  const { referral_rewards, referral_volume_traded } = useMemo(() => {
    if (!userInvites) {
      return { referral_rewards: 0, referral_volume_traded: 0 }
    }

    return userInvites.reduce(
      (acc, invite) => {
        invite.used_by.forEach((user) => {
          acc.referral_rewards += user.rewards_generated ? Number(user.rewards_generated) : 0
          acc.referral_volume_traded += user.volume_traded ? Number(user.volume_traded) : 0
        })
        return acc
      },
      { referral_rewards: 0, referral_volume_traded: 0 }
    )
  }, [userInvites])

  return (
    <div className="basis-xs flex flex-col gap-1 rounded-md h-full w-fit shrink-0">
      <div
        className={cn(
          'flex flex-col justify-between bg-secondary rounded-md flex-1 gap-4 p-4',
          isRTL && 'items-end'
        )}
      >
        <div
          className={cn('flex items-center justify-between w-full', isRTL && 'flex-row-reverse')}
        >
          <h2>{t('Rewards Earned')}</h2>
        </div>
        <h1 className="flex justify-start items-center h-full text-4xl font-semibold text-white">
          {referral_rewards.toString()}
        </h1>
      </div>
      <div
        className={cn(
          'flex flex-col bg-secondary rounded-md flex-1 gap-4 p-4',
          isRTL && 'items-end'
        )}
      >
        <div
          className={cn('flex items-center justify-between w-full', isRTL && 'flex-row-reverse')}
        >
          <h2>{t('Cumulative Referral Volume')}</h2>
        </div>
        <h1 className="flex justify-start items-center h-full text-4xl font-semibold text-white">
          {referral_volume_traded.toString()}
        </h1>
      </div>
    </div>
  )
}

export default ReferralStatsCard
