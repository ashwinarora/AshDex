'use client'
import { useScreenSize } from '@/hooks/useScreenSize'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/userStore'
import { useTranslate } from '@tolgee/react'
import { Button } from '../ui/button'
import ClaimInviteCode from './ClaimInviteCode'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'

const ReferralsHeader = () => {
  const { t } = useTranslate()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
  const { isMobile } = useScreenSize()
  const [openDialog, setOpenDialog] = useState<string | null>(null)

  if (isMobile) {
    return (
      <>
        <div className="flex flex-row gap-4 bg-transparent rounded-md items-center justify-between w-full h-fit py-4">
          <h1 className="text-2xl text-white text-start">{t('Referrals')}</h1>
          <Dialog
            open={openDialog === 'enter'}
            onOpenChange={(open) => setOpenDialog(open ? 'enter' : null)}
          >
            <DialogTrigger asChild>
              <Button size={'sm'} variant="default">
                {t('Enter Referral Code')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('Enter Referral Code')}</DialogTitle>
              </DialogHeader>
              <div className="min-h-[250px]">
                <ClaimInviteCode />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </>
    )
  }

  return (
    <div
      className={cn(
        'flex gap-4 bg-transparent rounded-md items-center justify-between w-full h-fit p-4',
        isRTL && 'flex-row-reverse'
      )}
    >
      <h1 className="text-3xl shrink-0 font-semibold text-white">{t('Referrals')}</h1>
      <Dialog
        open={openDialog === 'enter'}
        onOpenChange={(open) => setOpenDialog(open ? 'enter' : null)}
      >
        <DialogTrigger asChild>
          <Button size={'sm'} variant="default">
            {t('Enter Referral Code')}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('Enter Referral Code')}</DialogTitle>
          </DialogHeader>
          <div className="min-h-[250px]">
            <ClaimInviteCode />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ReferralsHeader
