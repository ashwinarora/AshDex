import React, { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import { AGENT_NAME, BUILDER_ADDRESS, BUILDER_FEE } from '@/utils/constants'
import { toast } from 'sonner'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { Dialog } from '@radix-ui/react-dialog'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { useShallow } from 'zustand/react/shallow'
import { ApiRequestError } from '@nktkas/hyperliquid'
import DepositModal from '../DepositWithdraw/DepositModal'

const EstablishConnectionModal = () => {
  const { address, chainId } = useConnection()
  const { sdkUserSignerClient, getFreshAgentWallet } = useHyperliquidStore(
    useShallow((state) => ({
      sdkUserSignerClient: state.sdkUserSignerClient,
      getFreshAgentWallet: state.getFreshAgentWallet
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
            if (!address) return
            const toastId = toast.loading('Approving agent...')
            try {
              // Always generate a fresh agent wallet when approving
              const freshAgentWallet = getFreshAgentWallet(address)
              await sdkUserSignerClient.approveAgent({
                agentAddress: freshAgentWallet.address,
                agentName: AGENT_NAME
              })
              await refetchAgentApproval()
              setIsApproving(true)
              toast.success('Agent approved successfully', {
                id: toastId
              })
            } catch (error) {
              console.error('Error approving agent:', error)
              if (error instanceof ApiRequestError) {
                if (error.message.includes('Must deposit before performing actions')) {
                  toast.info(
                    'Your wallet seems to be new. Please deposit some funds to establish connection.',
                    {
                      id: toastId
                    }
                  )
                  openDepositModal()
                } else {
                  toast.error('Something went wrong, check the console or contact support', {
                    id: toastId
                  })
                }
              } else {
                toast.error('Something went wrong, check the console or contact support', {
                  id: toastId
                })
              }
            }
          }}
        >
          {'Establish Connection'}
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
            const toastId = toast.loading('Approving fee...')
            try {
              await sdkUserSignerClient.approveBuilderFee({
                builder: BUILDER_ADDRESS,
                maxFeeRate: BUILDER_FEE
              })
              await refetchCurrentFeeApproval()
              toast.success('Fee approved successfully', {
                id: toastId
              })
            } catch (error) {
              console.error('Error approving fee:', error)
              toast.error('Something went wrong, check the console or contact support', {
                id: toastId
              })
            }
          }}
        >
          {'Approve Fee'}
        </Button>
      )
    }
    return (
      <Button variant={'outline'} onClick={closeModal}>
        {'Close'}
      </Button>
    )
  }

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{'Establish Connection'}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {
              'This signature is gas-free. It opens a decentralized channel for instant and gasless deposits.'
            }
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
