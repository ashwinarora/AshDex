import React, { useState } from 'react'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useTranslate } from '@tolgee/react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { useCreateInviteCode, useGetRewardsStats } from '@/hooks/invite'
import { Input } from '../ui/input'

function CreateCode() {
  const [createdCode, setCreatedCode] = useState('')
  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()
  const { refetch: refetchRewardsStats } = useGetRewardsStats()
  const { t } = useTranslate()

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
    } finally {
      setCreatedCode('')
      refetchRewardsStats()
    }
  }

  // Handle input change with validation
  const handleCodeChange = (value: string) => {
    // Only allow alphanumeric characters and convert to uppercase
    const filteredValue = value.replace(/[^A-Z0-9]/gi, '').toUpperCase()
    setCreatedCode(filteredValue)
  }

  return (
    <div className="w-full h-full flex flex-col gap-2 items-center justify-between p-2">
      <div className="w-full flex !h-24 flex-col gap-2">
        <h1 className="text-white font-medium text-lg">{t('Create a Referral Code')}</h1>
        <p className="text-white/70 font-medium text-sm">
          {t('This referral code is permanent and unique to you. Choose wisely.')}
        </p>
      </div>
      <Input
        value={createdCode}
        onChange={(e) => handleCodeChange(e.target.value)}
        className="w-fit w-min-10 text-center text-accent-foreground tracking-[0.5em]"
      />
      {!isAgentApproved || currentFeeApproval === 0 ? (
        <Button onClick={openAgentModal} className="w-full">
          Establish Connection
        </Button>
      ) : (
        <Button
          className="w-full"
          disabled={isCreatingInviteCode || createdCode.length < 4 || createdCode.length > 8}
          onClick={createInviteCode}
        >
          {isCreatingInviteCode ? t('Creating...') : t('Create')}
        </Button>
      )}
    </div>
  )
}

export default CreateCode
