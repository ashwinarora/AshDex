import { cn } from '@/lib/utils'
import { useTranslate } from '@tolgee/react'
import useUserStore from '@/store/userStore'
import { useGetRewardsStats } from '@/hooks/invite'
import { IconLoader2, IconAlertCircle, IconCopy } from '@tabler/icons-react'
import { toast } from 'sonner'
import { formatWithKMB } from '@/utils/format'

const ReferralStats = () => {
  const { t } = useTranslate()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
  const { data: rewardsStats, isLoading, error } = useGetRewardsStats()

  if (isLoading) {
    return (
      <div className="w-96 h-96 flex items-center justify-center flex-col bg-secondary rounded-md gap-2 p-4 flex-1 ">
        <IconLoader2 className="text-white size-10 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-96 h-96 items-center justify-center flex flex-col bg-secondary rounded-md gap-2 p-4 flex-1 ">
        <IconAlertCircle className="text-red size-10" />
        <span className="text-red text-sm">{t('Error loading stats')}</span>
      </div>
    )
  }

  const stats = [
    {
      label: t('Invite Code'),
      value: rewardsStats?.inviteCodes?.[0]?.inviteCode || '------'
    },
    {
      label: t('Total Referral Rewards'),
      // value: `$${rewardsStats?.totalReferralRewardsGenerated.toFixed(2) || '0.00'}`
      value: `$${formatWithKMB(Math.abs(parseFloat(rewardsStats?.totalReferralRewardsGenerated.toFixed(2) || '0.00')))}`
    },
    {
      label: t('Rewards Claimed'),
      value: `$${formatWithKMB(Math.abs(parseFloat(rewardsStats?.totalReferralRewardsClaimed.toFixed(2) || '0.00')))}`
    },
    {
      label: t('Available to Claim'),
      value: `$${formatWithKMB(Math.abs(parseFloat(rewardsStats?.availableReferralRewards.toFixed(2) || '0.00')))}`
    }
  ]

  return (
    <div className="flex flex-col flex-nowrap gap-1 w-96 h-96">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={cn(
            'flex flex-col bg-secondary rounded-md justify-between h-1/4 gap-2 p-4 flex-1 w-full',
            isRTL && 'items-end'
          )}
        >
          <div className="text-white/50 text-xs font-medium flex items-center gap-2">
            {stat.label}
            {stat.label === t('Invite Code') && (
              <IconCopy
                onClick={() => {
                  navigator.clipboard.writeText(stat.value)
                  toast.success(t('Copied to clipboard'))
                }}
                className="text-white/50 cursor-pointer hover:text-white transition-all size-3"
              />
            )}
          </div>
          <div className="text-white text-2xl font-semibold">{stat.value}</div>
        </div>
      ))}
    </div>
  )
}

export default ReferralStats
