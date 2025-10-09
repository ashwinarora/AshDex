import React from 'react'
import { toast } from 'sonner'
import { useTranslate } from '@tolgee/react'
import { Button } from '../ui/button'
import { useClaimRewards } from '@/hooks/invite'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
interface ClaimProps {
  totalClaim: number
}

function Rewards({ totalClaim }: ClaimProps) {
  const { t } = useTranslate()
  const { mutateAsync: claimRewards } = useClaimRewards()
  const { agentWallet } = useHyperliquidStore()
  console.log('🚀 ~ handleSubmit ~ agentWallet:', agentWallet)

  const handleSubmit = async () => {
    try {
      // TODO: Implement claim rewards
      const signature = await agentWallet?.signMessage({
        message: JSON.stringify({
          claimAmount: totalClaim.toString()
        })
      })

      if (!signature) {
        toast.error(t('Failed to sign message'))
        return
      }

      await claimRewards({ claimAmount: totalClaim.toString(), signature })
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
    <div className="w-full h-full flex flex-col gap-2 items-center justify-between p-2">
      <div className="w-full !h-24 flex flex-col gap-2">
        <h1 className="text-white font-medium text-lg">{t('Claim Rewards')}</h1>
        <p className="text-white/50 font-medium text-sm">
          {t(
            `Claim your bonuses and rewards for your referral activity. If you’ve referred new users or they’ve completed the program’s requirements, click 'Claim' to receive your reward!`
          )}
        </p>
      </div>
      <div className="flex flex-col text-sm gap-2 items-start justify-between w-full">
        <h2>{t('Unclaimed Rewards')}</h2>
        <h1 className="text-4xl font-semibold text-white">{totalClaim.toString()}</h1>
      </div>
      <Button disabled={totalClaim === 0} onClick={handleSubmit} className="w-full">
        {totalClaim === 0 ? t('No Rewards to Claim') : t('Claim')}
      </Button>
    </div>
    // <div className="p-2">
    //   {' '}
    //   {REFERRALS_CLAIM_DESC?.map((desc, index) => (
    //     <span
    //       key={index}
    //       className="font-medium opacity-90 max-sm:text-sm text-base text-[#8B8BA0]"
    //     >
    //       {desc}
    //     </span>
    //   ))}
    //   <div
    //     className={`mt-2 flex items-center justify-between mb-2 w-full rounded-md py-2.5 focus:outline-none focus:none focus:none placeholder:text-[#8B8BA0] font-medium`}
    //   >
    //     <span className="text-base font-medium opacity-50 text-[#E8E0F1FF]">Claim in rewards</span>
    //     <span className="text-white font-medium text-lg">${totalClaim}</span>
    //   </div>
    //   <button
    //     disabled={totalClaim === 0}
    //     onClick={handleSubmit}
    //     className={`py-[10px] ${isCreateCode ? 'min-2xl:mt-22 mt-8' : 'mt-3 min-2xl:mt-8'} px[24px] tracking-[0em] disabled:opacity-50 disabled:bg-white/10 disabled:text-[#8B8BA0] font-bold rounded-xl w-full text-base bg-primary text-white cursor-pointer`}
    //   >
    //     {'Claim'}
    //   </button>
    // </div>
  )
}

export default Rewards
