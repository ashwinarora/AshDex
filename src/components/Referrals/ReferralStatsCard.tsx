import { useReferralsInfo } from '@/hooks/useReferralsInfo'
import { cn } from '@/lib/utils'
import { Skeleton } from '../ui/skeleton'
import { useTranslate } from '@tolgee/react'
import useUserStore from '@/store/userStore'

const ReferralStatsCard = () => {
  const { data: referralsDetails } = useReferralsInfo()
  const { t } = useTranslate()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')

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
        <h1 className="text-4xl font-semibold text-white">
          {referralsDetails?.claimedRewards ? (
            `$${referralsDetails.claimedRewards}`
          ) : (
            <Skeleton className="w-36 h-9" />
          )}
        </h1>
      </div>
      <div
        className={cn(
          'flex flex-col justify-between bg-secondary rounded-md flex-1 gap-4 p-4',
          isRTL && 'items-end'
        )}
      >
        <div
          className={cn('flex items-center justify-between w-full', isRTL && 'flex-row-reverse')}
        >
          <h2>{t('Your Volume')}</h2>
        </div>
        <h1 className="text-4xl font-semibold text-white">
          {referralsDetails?.cumVlm ? (
            `$${referralsDetails.cumVlm}`
          ) : (
            <Skeleton className="w-36 h-9" />
          )}
        </h1>
      </div>
    </div>
  )
}

export default ReferralStatsCard
