'use client'
import { useState } from 'react'
import Image from 'next/image'
import successicon from '@/assets/images/success_icon.svg'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { InviteCode } from '@/components/Referrals/InviteCode'
import { useAcceptInviteCode } from '@/hooks/invite'
import { useUser } from '@/hooks/useUser'
import { toast } from 'sonner'

function ClaimInviteCode() {
  const [code, setCode] = useState('')
  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()
  const { agentWallet } = useHyperliquidStore()
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
    if (code.length !== 6) {
      toast.error('Code must be exactly 6 characters')
      return
    }

    if (!agentWallet) {
      toast.error('Agent wallet not found')
      return
    }

    try {
      // Sign the payload with agent wallet
      const signature = await agentWallet?.signMessage({
        message: JSON.stringify({ inviteCode: code })
      })

      if (!signature) {
        toast.error('Failed to sign message')
        return
      }

      await acceptInviteCodeMutation({ inviteCode: code, signature })
    } catch (error) {
      toast.error('Failed to claim invite code')
      console.error('Error claiming invite code:', error)
    }
  }

  // Show loading state while fetching user data
  if (isUserLoading) {
    return (
      <div className="p-2 flex flex-col gap-y-5 pt-12 pb-3">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
        <p className="font-semibold text-white text-base text-center">Loading...</p>
      </div>
    )
  }
  // Show if invite is already claimed
  if (user && user.invited_by !== null) {
    return (
      <div className="p-2 flex flex-col gap-y-5 pt-12 pb-3">
        <div className="flex justify-center">
          <Image src={successicon} alt="Already Claimed" style={{ width: 48, height: 'auto' }} />
        </div>
        <p className="font-semibold text-white text-base text-center">Invite already claimed</p>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="p-2 flex flex-col gap-y-5 pt-12 pb-3">
        <div className="flex justify-center">
          <Image src={successicon} alt="Success" style={{ width: 48, height: 'auto' }} />
        </div>
        <p className="font-semibold text-white text-base text-center">
          The code has been successfully applied
        </p>
      </div>
    )
  } else {
    return (
      <div className="p-2">
        <span className="opacity-90 font-medium text-[#8B8BA0] max-sm:text-sm text-base">
          This will allow you to earn bonuses or other rewards offered by the program. Simply copy
          and paste the code into this field.
        </span>
        <InviteCode value={code} onChange={handleCodeChange} className="mt-4 mb-2" />
        {!isAgentApproved || currentFeeApproval === 0 ? (
          <button
            onClick={openAgentModal}
            className={`py-2 disabled:opacity-50 disabled:bg-white/10 disabled:text-[#8B8BA0] font-bold rounded-xl w-full text-base bg-primary text-white cursor-pointer`}
          >
            Establish Connection
          </button>
        ) : (
          <button
            disabled={code.length !== 6 || isAcceptingInviteCode}
            onClick={claimInviteCode}
            className={`py-2 disabled:text-[#8B8BA0] rounded-xl w-full text-base bg-primary text-white cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isAcceptingInviteCode ? 'Processing...' : 'Accept Referral'}
          </button>
        )}
      </div>
    )
  }
}

export default ClaimInviteCode
