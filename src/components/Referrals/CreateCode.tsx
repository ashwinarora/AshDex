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
      <div className="flex flex-col items-center">
        <p className="text-white/80 font-medium text-base mb-4">{t('Your referral code is:')}</p>
        <p className="text-white text-2xl font-bold mb-6">{existingInviteCode}</p>
        <button
          className="py-[10px] px-[24px] tracking-[0em] font-bold rounded-xl bg-primary text-white text-base cursor-pointer hover:bg-primary/90 transition-colors"
          onClick={() => navigator.clipboard.writeText(existingInviteCode)}
        >
          {t('Copy Code')}
        </button>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col gap-2 items-center justify-between p-2">
      <div className="w-full flex flex-col !h-24 gap-2">
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
    // <div className="p-2">
    //   <div className={`flex flex-col gap-4 w-full justify-between items-center`}>
    //     <div className="text-white/80 font-medium text-base">
    //       This referral code is permanent and unique to you. Choose wisely.
    //     </div>
    //     <div className="">
    //       <label className="text-sm font-medium text-white/70 mb-2 block">
    //         Create Referral Code (6 characters)
    //       </label>
    //       <InviteCode value={createdCode} onChange={handleCodeChange} />
    //     </div>
    //     <div className="w-full">
    //       {!isAgentApproved || currentFeeApproval === 0 ? (
    //         <button
    //           onClick={openAgentModal}
    //           className={` tracking-[0em] disabled:opacity-50 disabled:bg-white/10 disabled:text-[#8B8BA0] font-bold rounded-xl w-full text-base bg-primary text-white cursor-pointer hover:bg-primary/90 transition-colors`}
    //         >
    //           Establish Connection
    //         </button>
    //       ) : (
    //         <button
    //           onClick={createInviteCode}
    //           disabled={isCreatingInviteCode || createdCode.length !== 6}
    //           className={` tracking-[0em] disabled:text-[#8B8BA0] font-bold rounded-xl w-full text-base bg-primary text-white cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
    //         >
    //           {isCreatingInviteCode ? t('Creating...') : t('Create')}
    //         </button>
    //       )}
    //     </div>
    //   </div>
    // </div>
  )
}

export default CreateCode
