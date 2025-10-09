import { cn } from '@/lib/utils'
import { useTranslate } from '@tolgee/react'
import useUserStore from '@/store/userStore'
import { useGetRewardsStats } from '@/hooks/invite'
import { IconLoader2, IconAlertCircle } from '@tabler/icons-react'

const ReferralStats = () => {
  const { t } = useTranslate()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
  const { data: rewardsStats, isLoading, error } = useGetRewardsStats()

  if (isLoading) {
    return (
      <div className="w-full h-32 flex items-center justify-center">
        <IconLoader2 className="text-white size-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-32 flex items-center justify-center gap-2">
        <IconAlertCircle className="text-red size-6" />
        <span className="text-red text-sm">{t('Error loading stats')}</span>
      </div>
    )
  }

  const stats = [
    {
      label: t('Invite Code'),
      value: rewardsStats?.inviteCodes[0].inviteCode || ''
    },
    {
      label: t('Total Referral Rewards'),
      value: `$${rewardsStats?.totalReferralRewardsGenerated.toFixed(2) || '0.00'}`
    },
    {
      label: t('Rewards Claimed'),
      value: `$${rewardsStats?.totalReferralRewardsClaimed.toFixed(2) || '0.00'}`
    },
    {
      label: t('Available to Claim'),
      value: `$${rewardsStats?.availableReferralRewards.toFixed(2) || '0.00'}`
    }
  ]

  return (
    <div className="flex flex-wrap gap-1 w-full">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={cn(
            'flex flex-col bg-secondary rounded-md gap-2 p-4 flex-1 min-w-[200px]',
            isRTL && 'items-end'
          )}
        >
          <div className="text-white/50 text-xs font-medium">{stat.label}</div>
          <div className="text-white text-2xl font-semibold">{stat.value}</div>
        </div>
      ))}
    </div>
  )
}

export default ReferralStats
