'use client'
import { useState } from 'react'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useAcceptInviteCode } from '@/hooks/invite'
import { useUser } from '@/hooks/useUser'
import { toast } from 'sonner'
import { IconLoader2, IconRosetteDiscountCheck } from '@tabler/icons-react'
import { useTranslate } from '@tolgee/react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

function ClaimInviteCode() {
  const [code, setCode] = useState('')
  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()
  const { agentWallet } = useHyperliquidStore()
  const { t } = useTranslate()
  const { data: user, isLoading: isUserLoading } = useUser()

  const {
    mutateAsync: acceptInviteCodeMutation,
    isSuccess,
    isPending: isAcceptingInviteCode
  } = useAcceptInviteCode()

  const handleCodeChange = (value: string) => {
    setCode(value.toUpperCase())
  }

  async function claimInviteCode() {
    if (code.length < 4 || code.length > 8) {
      toast.error('Code must be exactly 6 characters')
      return
    }

    if (!agentWallet) {
      toast.error('Agent wallet not found')
      return
    }

    try {
      await acceptInviteCodeMutation(code)
    } catch (error) {
      toast.error('Failed to claim invite code')
      console.error('Error claiming invite code:', error)
    }
  }

  // Show loading state while fetching user data
  if (isUserLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <IconLoader2 className="animate-spin text-white/50 text-8xl" />
      </div>
    )
  }
  // Show if invite is already claimed
  if (user && user.invited_by !== null) {
    return (
      <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
        <IconRosetteDiscountCheck className="size-10 text-green" />
        <h1 className="text-white font-medium">{t('Invite already claimed')}</h1>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
        <IconRosetteDiscountCheck className="size-10 text-green" />
        <h1 className="text-white font-medium">{t('The code has been successfully applied')}</h1>
      </div>
    )
  } else {
    return (
      <div className="w-full h-full flex flex-col gap-2 items-center justify-between p-2">
        <div className="w-full flex !h-24 flex-col gap-2">
          <h1 className="text-white font-medium text-lg">{t('Enter Referral Code')}</h1>
          <p className="text-white/50 font-medium text-sm">
            {t(
              'This will allow you to earn bonuses or other rewards offered by the program. Simply copy and paste the code into this field.'
            )}
          </p>
        </div>
        <Input
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          className="w-fit w-min-10 text-center text-accent-foreground"
          style={{ letterSpacing: '0.5em' }}
        />
        {!isAgentApproved || currentFeeApproval === 0 ? (
          <Button onClick={openAgentModal} className="w-full">
            Establish Connection
          </Button>
        ) : (
          <Button
            className="w-full"
            disabled={code.length !== 6 || isAcceptingInviteCode}
            onClick={claimInviteCode}
          >
            {isAcceptingInviteCode ? 'Processing...' : 'Accept Referral'}
          </Button>
        )}
      </div>
    )
  }
}

export default ClaimInviteCode
