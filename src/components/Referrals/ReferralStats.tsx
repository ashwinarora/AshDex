'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useTranslate } from '@tolgee/react'
import useUserStore from '@/store/userStore'
import { useGetRewardsStats } from '@/hooks/invite'
import { IconLoader2, IconAlertCircle, IconCopy, IconLink } from '@tabler/icons-react'
import { toast } from 'sonner'
import { formatWithKMB } from '@/utils/format'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import CreateCode from './CreateCode'
import Rewards from './Rewards'
import { Button } from '../ui/button'

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
    <div
      className={cn(
        'text-white/70 text-xs font-medium flex items-center justify-between w-full',
        isRTL && 'flex-row-reverse'
      )}
    >
      <span>{label}</span>
      {action}
    </div>
    <div className={cn('text-white text-4xl font-semibold', isRTL && 'text-right')}>{value}</div>
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

  // Generate the full invite link
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const inviteLink = inviteCode ? `${baseUrl}?inviteCode=${inviteCode}` : ''

  if (isLoading) {
    return (
      <div className="flex flex-col flex-nowrap gap-1 w-full xl:w-96 lg:h-full h-72 bg-secondary rounded-md items-center justify-center">
        <IconLoader2 className="text-white size-10 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col flex-nowrap gap-1 w-full xl:w-96 h-full bg-secondary rounded-md items-center justify-center">
        <IconAlertCircle className="text-red size-10" />
        <span className="text-red text-sm">{t('Error loading stats')}</span>
      </div>
    )
  }

  const formatUSD = (value: number) => `$${formatWithKMB(Math.abs(value))}`

  return (
    <div className="flex flex-col flex-nowrap gap-1 w-full xl:w-96 h-full">
      {/* Your Invite Code Card */}
      <div
        className={cn(
          'flex flex-col bg-secondary rounded-md justify-between h-1/4 gap-2 p-4 flex-1 w-full',
          isRTL && 'items-end'
        )}
      >
        <div
          className={cn(
            'text-white/70 text-xs font-medium flex items-center justify-between w-full',
            isRTL && 'flex-row-reverse'
          )}
        >
          <span>{t('Your Invite Code')}</span>
          {!inviteCode && (
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
          )}
        </div>

        {inviteCode ? (
          <div className="flex flex-col gap-3 w-full">
            {/* Invite Code Row */}
            <div
              className={cn('flex items-center justify-between gap-2', isRTL && 'flex-row-reverse')}
            >
              <span className="text-white text-3xl font-semibold tracking-wider">{inviteCode}</span>
              <Button
                size={'sm'}
                variant={'outline'}
                onClick={() => {
                  navigator.clipboard.writeText(inviteCode)
                  toast.success(t('Code copied to clipboard'))
                }}
                className="flex items-center gap-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs px-2 py-1.5 rounded"
                title={t('Copy Code')}
              >
                <IconCopy className="size-4" />
                <span className="hidden sm:inline">{t('Code')}</span>
              </Button>
            </div>

            {/* Invite Link Row */}
            <div
              className={cn(
                'flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-md px-3 py-2',
                isRTL && 'flex-row-reverse'
              )}
            >
              <span
                className={cn(
                  'text-white/50 text-xs truncate flex-1 font-mono',
                  isRTL && 'text-right'
                )}
              >
                {inviteLink}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink)
                  toast.success(t('Link copied to clipboard'))
                }}
                className="flex items-center gap-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs px-2 py-1.5 rounded shrink-0"
                title={t('Copy Link')}
              >
                <IconLink className="size-4" />
                <span className="hidden sm:inline">{t('Link')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-white text-4xl font-semibold">------</div>
        )}
      </div>

      <StatCard label={t('Total Referral Rewards')} value={formatUSD(totalRewards)} isRTL={isRTL} />

      <StatCard label={t('Rewards Claimed')} value={formatUSD(claimedRewards)} isRTL={isRTL} />

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
