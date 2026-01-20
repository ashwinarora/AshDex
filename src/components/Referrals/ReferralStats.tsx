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

const StatCard = ({
  label,
  value,
  action,
  isRTL
}: {
  label: string
  value: string
  action?: React.ReactNode
  isRTL: boolean
}) => (
  <div
    className={cn(
      'flex flex-col bg-secondary rounded-md justify-between h-1/4 gap-2 p-4 flex-1 w-full',
      isRTL && 'items-end'
    )}
  >
    <div className="text-white/70 text-xs font-medium flex items-center justify-between w-full">
      <span>{label}</span>
      {action}
    </div>
    <div className="text-white text-4xl font-semibold">{value}</div>
  </div>
)

const ReferralStats = () => {
  const { t } = useTranslate()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
  const { data: rewardsStats, isLoading, error } = useGetRewardsStats()
  const [openDialog, setOpenDialog] = useState<string | null>(null)

  const inviteCode = rewardsStats?.inviteCodes?.[0]?.inviteCode
  const totalRewards = rewardsStats?.totalReferralRewardsGenerated ?? 0
  const claimedRewards = rewardsStats?.totalReferralRewardsClaimed ?? 0
  const availableRewards = rewardsStats?.availableReferralRewards ?? 0

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

  const formatUSD = (value: number) => `$${formatWithKMB(Math.abs(value))}`

  return (
    <div className="flex flex-col flex-nowrap gap-1 w-full lg:w-96 h-full">
      <StatCard
        label={t('Your Invite Code')}
        value={inviteCode || '------'}
        isRTL={isRTL}
        action={
          inviteCode ? (
            <IconCopy
              onClick={() => {
                navigator.clipboard.writeText(inviteCode)
                toast.success(t('Copied to clipboard'))
              }}
              className="text-white/70 cursor-pointer hover:text-white transition-all size-3"
            />
          ) : (
            <Dialog
              open={openDialog === 'create'}
              onOpenChange={(open) => setOpenDialog(open ? 'create' : null)}
            >
              <DialogTrigger asChild>
                <span className="underline cursor-pointer hover:text-white transition-all">
                  {t('Create Code')}
                </span>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                  <DialogTitle>{t('Create Code')}</DialogTitle>
                </DialogHeader>
                <div className="min-h-[250px]">
                  <CreateCode />
                </div>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <StatCard
        label={t('Total Referral Rewards')}
        value={formatUSD(totalRewards)}
        isRTL={isRTL}
      />

      <StatCard
        label={t('Rewards Claimed')}
        value={formatUSD(claimedRewards)}
        isRTL={isRTL}
      />

      <StatCard
        label={t('Available to Claim')}
        value={formatUSD(availableRewards)}
        isRTL={isRTL}
        action={
          <Dialog
            open={openDialog === 'rewards'}
            onOpenChange={(open) => setOpenDialog(open ? 'rewards' : null)}
          >
            <DialogTrigger asChild>
              <span className="underline cursor-pointer hover:text-white transition-all">
                {t('Claim')}
              </span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>{t('Rewards')}</DialogTitle>
              </DialogHeader>
              <div className="min-h-[250px]">
                <Rewards totalClaim={availableRewards} />
              </div>
            </DialogContent>
          </Dialog>
        }
      />
    </div>
  )
}

export default ReferralStats
