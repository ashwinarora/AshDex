import React, { useState } from 'react'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useTranslate } from '@tolgee/react'
import { useInviteCode, useCreateInviteCode } from '@/hooks/invite'
import { toast } from 'sonner'
import { InviteCode } from './InviteCode'
import { Button } from '../ui/button'

function CreateCode() {
  const [createdCode, setCreatedCode] = useState('')
  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()
  const { t } = useTranslate()

  const { data: existingInviteCode } = useInviteCode()
  const { mutateAsync: createInviteCodeMutation, isPending: isCreatingInviteCode } =
    useCreateInviteCode()

  async function createInviteCode() {
    if (createdCode.length < 4 || createdCode.length > 8) {
      toast.error('Code length must be between 4 and 8 characters')
      return
    }
    try {
      await createInviteCodeMutation(createdCode)
    } catch (error) {
      toast.error('Failed to create invite code')
      console.error('Error creating invite code:', error)
    }
  }

  // Handle input change with validation
  const handleCodeChange = (value: string) => {
    // Only allow alphanumeric characters and convert to uppercase
    const filteredValue = value.replace(/[^A-Z0-9]/gi, '').toUpperCase()
    setCreatedCode(filteredValue)
  }

  // Show existing invite code if it exists
  if (existingInviteCode) {
    return (
      <div className="w-full h-full flex flex-col gap-2 items-center justify-between p-2">
        <div className="w-full flex !h-24 flex-col gap-2">
          <h1 className="text-white font-medium text-lg">{t('Your referral code')}</h1>
          <p className="text-white/50 font-medium text-sm">
            {t(
              'This will allow you to earn bonuses or other rewards offered by the program. Simply share it with your friends and earn rewards.'
            )}
          </p>
        </div>
        <h1 className="text-white text-5xl font-bold mb-6">{existingInviteCode}</h1>
        <Button
          className="w-full"
          onClick={() => {
            navigator.clipboard.writeText(existingInviteCode)
            toast.success(t('Code copied to clipboard'))
          }}
        >
          {t('Copy Code')}
        </Button>
      </div>
      // <div className="flex flex-col items-center">
      //   <p className="text-white/80 font-medium text-base mb-4">{t('Your referral code is:')}</p>
      //   <p className="text-white text-2xl font-bold mb-6">{existingInviteCode}</p>
    )
  }

  return (
    <div className="w-full h-full flex flex-col gap-2 items-center justify-between p-2">
      <div className="w-full flex !h-24 flex-col gap-2">
        <h1 className="text-white font-medium text-lg">{t('Create a Referral Code')}</h1>
        <p className="text-white/50 font-medium text-sm">
          {t('This referral code is permanent and unique to you. Choose wisely.')}
        </p>
      </div>
      <InviteCode value={createdCode} onChange={handleCodeChange} />
      {!isAgentApproved || currentFeeApproval === 0 ? (
        <Button onClick={openAgentModal} className="w-full">
          Establish Connection
        </Button>
      ) : (
        <Button
          className="w-full"
          disabled={isCreatingInviteCode || (createdCode.length > 4 && createdCode.length < 8)}
          onClick={createInviteCode}
        >
          {isCreatingInviteCode ? t('Creating...') : t('Create')}
        </Button>
      )}
    </div>
  )
}

export default CreateCode
