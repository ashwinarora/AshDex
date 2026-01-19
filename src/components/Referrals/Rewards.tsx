import React from 'react'
import { toast } from 'sonner'
import { useTranslate } from '@tolgee/react'
import { Button } from '../ui/button'
import { useClaimRewards } from '@/hooks/invite'
import { formatWithKMB } from '@/utils/format'
interface ClaimProps {
  totalClaim: number
}

function Rewards({ totalClaim }: ClaimProps) {
  const { t } = useTranslate()
  const { mutateAsync: claimRewards } = useClaimRewards()

  const handleSubmit = async () => {
    try {
      await claimRewards()
      toast.success(t('Claim Successful!'), {
        description: `You’ve successfully claimed ${totalClaim}. The funds have been added to your balance.`
      })
    } catch (error) {
      toast.error(t('Failed to claim rewards'), {
        description: t('error claiming rewards:') + error
      })
    }
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 items-center justify-between p-2">
      <div className="w-full min-h-24 h-fit flex flex-col gap-2">
        <h1 className="text-white font-medium text-lg">{t('Claim Rewards')}</h1>
        <p className="text-white/70 font-medium text-sm">
          {t(
            `Claim your bonuses and rewards for your referral activity. If you’ve referred new users or they’ve completed the program’s requirements, click 'Claim' to receive your reward!`
          )}
        </p>
      </div>
      <div className="flex flex-col text-sm gap-2 items-start justify-between w-full">
        <h2>{t('Unclaimed Rewards')}</h2>
        <h1 className="text-4xl font-semibold text-white">
          ${formatWithKMB(Math.abs(parseFloat(totalClaim.toString())))}
        </h1>
      </div>
      <Button disabled={totalClaim === 0} onClick={handleSubmit} className="w-full">
        {totalClaim === 0 ? t('No Rewards to Claim') : t('Claim')}
      </Button>
    </div>
  )
}

export default Rewards
