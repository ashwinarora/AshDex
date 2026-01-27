'use client'

import { Suspense } from 'react'
import Trading from '@/components/Trading/Trading'
import { useInviteCodeCapture } from '@/hooks/useInviteCodeCapture'
import { useGetInvite } from '@/hooks/invite/useGetInvite'
import { useInviteCode } from '@/store/ReferralStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import ClaimInviteCode from '@/components/Referrals/ClaimInviteCode'
import { useTranslate } from '@tolgee/react'

function HomeContent() {
  const { t } = useTranslate()
  const { showReferralPrompt, setShowReferralPrompt } = useInviteCodeCapture()
  const { refetch: refetchReferrer } = useGetInvite()
  const { dismissReferralPrompt } = useInviteCode()

  const handleDismissPermanently = () => {
    dismissReferralPrompt()
    setShowReferralPrompt(false)
  }

  return (
    <>
      <Trading />
      <Dialog open={showReferralPrompt} onOpenChange={setShowReferralPrompt}>
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{t('Enter A Referral Code')}</DialogTitle>
            <DialogDescription>
              {t('Enter a referral code to earn bonuses and rewards.')}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-[200px]">
            <ClaimInviteCode
              refetchReferrer={refetchReferrer}
              onDismissPermanently={handleDismissPermanently}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  )
}
