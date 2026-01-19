'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useTranslate } from '@tolgee/react'
import useUserStore from '@/store/userStore'
import { useGetRewardsStats } from '@/hooks/invite'
import { IconLoader2, IconAlertCircle, IconCopy } from '@tabler/icons-react'
import { toast } from 'sonner'
import { formatWithKMB } from '@/utils/format'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import CreateCode from './CreateCode'
import Rewards from './Rewards'

const ReferralStats = () => {
  const { t } = useTranslate()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
  const { data: rewardsStats, isLoading, error } = useGetRewardsStats()
  const [openDialog, setOpenDialog] = useState<string | null>(null)

  const hasInviteCode = rewardsStats?.inviteCodes?.[0]?.inviteCode
  const availableRewards = rewardsStats?.availableReferralRewards || 0

  if (isLoading) {
    return (
      <div className="flex flex-col flex-nowrap gap-1 w-full lg:w-96 lg:h-full h-72 bg-secondary rounded-md items-center justify-center">
        <IconLoader2 className="text-white size-10 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col flex-nowrap gap-1 w-full lg:w-96 h-full bg-secondary rounded-md items-center justify-center">
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
    <div className="flex flex-col flex-nowrap gap-1 w-full lg:w-96 h-full">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={cn(
            'flex flex-col bg-secondary rounded-md justify-between h-1/4 gap-2 p-4 flex-1 w-full',
            isRTL && 'items-end'
          )}
        >
          <div className="text-white/70 text-xs font-medium flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {stat.label}
              {stat.label === t('Invite Code') && hasInviteCode && (
                <IconCopy
                  onClick={() => {
                    navigator.clipboard.writeText(stat.value)
                    toast.success(t('Copied to clipboard'))
                  }}
                  className="text-white/70 cursor-pointer hover:text-white transition-all size-3"
                />
              )}
            </div>
            {stat.label === t('Invite Code') && !hasInviteCode && (
              <Dialog
                open={openDialog === 'create'}
                onOpenChange={(open) => setOpenDialog(open ? 'create' : null)}
              >
                <DialogTrigger asChild>
                  <span className="underline cursor-pointer hover:text-white transition-all">
                    {t('Create Code')}
                  </span>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('Create Code')}</DialogTitle>
                  </DialogHeader>
                  <div className="min-h-[250px]">
                    <CreateCode />
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {stat.label === t('Available to Claim') && (
              <Dialog
                open={openDialog === 'rewards'}
                onOpenChange={(open) => setOpenDialog(open ? 'rewards' : null)}
              >
                <DialogTrigger asChild>
                  <span className="underline cursor-pointer hover:text-white transition-all">
                    {t('Claim')}
                  </span>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('Rewards')}</DialogTitle>
                  </DialogHeader>
                  <div className="min-h-[250px]">
                    <Rewards totalClaim={availableRewards} />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="text-white text-4xl font-semibold">{stat.value}</div>
        </div>
      ))}
    </div>
  )
}

export default ReferralStats
