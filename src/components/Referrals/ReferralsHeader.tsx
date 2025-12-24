'use client'
import { useScreenSize } from '@/hooks/useScreenSize'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/userStore'
import { useTranslate } from '@tolgee/react'
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger
} from '../ui/stepper'
import { REFERRALSDATA } from '@/utils/constants'
import { Button } from '../ui/button'
import ClaimInviteCode from './ClaimInviteCode'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'

const ReferralsHeader = () => {
  const { t } = useTranslate()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
  const { isMobile } = useScreenSize()

  if (isMobile) {
    return (
      <>
        <div className="flex flex-col gap-4 bg-transparent rounded-md items-start justify-between w-full h-fit p-4">
          <h1 className="text-2xl text-white text-start">{t('Referrals')}</h1>
          <Stepper className="h-fit w-fit flex gap-2 items-center">
            <StepperNav className="w-fit shrink-0">
              {REFERRALSDATA.map((step, index) => (
                <StepperItem
                  key={index}
                  step={index}
                  className="relative w-fit items-center shrink-0"
                >
                  <StepperTrigger disabled className="flex justify-start w-fit gap-1.5">
                    <StepperIndicator className="bg-primary">
                      {<step.icon className="size-4 text-white" />}
                    </StepperIndicator>
                    <div className="flex flex-col text-nowrap w-fit items-start gap-0.5">
                      <StepperTitle>{step.label}</StepperTitle>
                    </div>
                  </StepperTrigger>
                  {REFERRALSDATA.length > index + 1 && (
                    <StepperSeparator className="mx-2 w-10 bg-white/100" />
                  )}
                </StepperItem>
              ))}
            </StepperNav>
          </Stepper>
        </div>
      </>
    )
  }

  const [openDialog, setOpenDialog] = useState<string | null>(null)

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
          <Button variant="outline">{t('Enter Referral Code')}</Button>
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
