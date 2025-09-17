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
import DepositModal from '../DepositWithdraw/DepositModal'

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
    isModalOpen,
    openDepositModal,
    closeDepositModal,
    isDepositModalOpen
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
            const toastId = toast.loading(t('Approving agent...'))
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
                if (error.message.includes('Must deposit before performing actions')) {
                  toast.info(
                    t(
                      'Your wallet seems to be new. Please deposit some funds to establish connection.'
                    ),
                    {
                      id: toastId
                    }
                  )
                  openDepositModal()
                } else {
                  toast.error(`${t('Agent approval failed.')} ${error.message}`, {
                    id: toastId
                  })
                }
              } else {
                toast.error(t('An unexpected error occurred. Please try again.'), {
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
            const toastId = toast.loading(t('Approving fee...'))
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
                toast.error(`${t('Fee approval failed.')} ${error.message}`, {
                  id: toastId
                })
              } else {
                toast.error(t('An unexpected error occurred'), {
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
    <>
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
      {isDepositModalOpen && (
        <DepositModal isOpen={isDepositModalOpen} onClose={() => closeDepositModal()} />
      )}
    </>
  )
}

export default EstablishConnectionModal
