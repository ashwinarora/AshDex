import React, { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { AGENT_NAME, BUILDER_ADDRESS, BUILDER_FEE } from '@/utils/constants'
import { toast } from 'sonner'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { Dialog } from '@radix-ui/react-dialog'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { useShallow } from 'zustand/react/shallow'
import { ApiRequestError } from '@nktkas/hyperliquid'
import { useTranslate } from '@tolgee/react'

const EstablishConnectionModal = () => {
  const { t } = useTranslate()
  const { chainId } = useAccount()
  const { agentWallet, sdkUserSignerClient } = useHyperliquidStore(
    useShallow((state) => ({
      agentWallet: state.agentWallet,
      sdkUserSignerClient: state.sdkUserSignerClient
    }))
  )
  const [isApproving, setIsApproving] = useState(false)
  const {
    closeModal,
    refetchAgentApproval,
    isAgentApproved,
    currentFeeApproval,
    refetchCurrentFeeApproval,
    isModalOpen
  } = useAgentApproval()

  useEffect(() => {
    if (isApproving && isAgentApproved && currentFeeApproval > 0) {
      closeModal()
      setIsApproving(false)
    }
  }, [isApproving, isAgentApproved, currentFeeApproval, closeModal])

  const getButton = () => {
    if (!isAgentApproved) {
      return (
        <Button
          variant={'default'}
          onClick={async () => {
            if (!chainId) return
            if (!sdkUserSignerClient) return
            if (!agentWallet) return
            const toastId = toast.loading('⏳ Approving agent…')
            try {
              await sdkUserSignerClient.approveAgent({
                agentAddress: agentWallet.address,
                agentName: AGENT_NAME
              })
              await refetchAgentApproval()
              setIsApproving(true)
              toast.success(t('Agent approved successfully'), {
                id: toastId
              })
            } catch (error) {
              console.error('Error approving agent:', error)
              if (error instanceof ApiRequestError) {
                toast.error(error.message, {
                  id: toastId
                })
              } else {
                toast.error('An unexpected error occurred', {
                  id: toastId
                })
              }
            }
          }}
        >
          {t('Establish Connection')}
        </Button>
      )
    }
    if (currentFeeApproval === 0) {
      return (
        <Button
          variant={'default'}
          onClick={async () => {
            if (!chainId) return
            if (!sdkUserSignerClient) return
            const toastId = toast.loading('Approving fee…')
            try {
              await sdkUserSignerClient.approveBuilderFee({
                builder: BUILDER_ADDRESS,
                maxFeeRate: BUILDER_FEE
              })
              await refetchCurrentFeeApproval()
              toast.success(t('Fee approved successfully'), {
                id: toastId
              })
            } catch (error) {
              console.error('Error approving fee:', error)
              if (error instanceof ApiRequestError) {
                toast.error(error.message, {
                  id: toastId
                })
              } else {
                toast.error('An unexpected error occurred', {
                  id: toastId
                })
              }
            }
          }}
        >
          {t('Approve Fee')}
        </Button>
      )
    }
    return (
      <Button variant={'outline'} onClick={closeModal}>
        {t('Close')}
      </Button>
    )
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Establish Connection')}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {t(
            'This signature is gas-free. It opens a decentralized channel for instant and gasless deposits.'
          )}
        </DialogDescription>
        {getButton()}
      </DialogContent>
    </Dialog>
  )
}

export default EstablishConnectionModal
