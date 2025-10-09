import { cn } from '@/lib/utils'
import { useTranslate } from '@tolgee/react'
import useUserStore from '@/store/userStore'
import { useGetRewardsStats } from '@/hooks/invite/useGetRewardsStats'

const ReferralStatsCard = () => {
  const { t } = useTranslate()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
  const { data: rewardsStats } = useGetRewardsStats()

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
          {rewardsStats?.totalReferralRewardsGenerated.toString()}
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
          {rewardsStats?.totalVolumeTradedByReferral.toString()}
        </h1>
      </div>
    </div>
  )
}

export default ReferralStatsCard
