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
import { toastSdkError } from '@/lib/toastSdkError'
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
              // Preserve the "new wallet — please deposit" branch because it
              // triggers a specific side-effect (openDepositModal). All other
              // errors go through the shared helper, which extracts the real
              // Hyperliquid message and downgrades user-cancels to an info
              // toast.
              if (
                error instanceof ApiRequestError &&
                error.message.includes('Must deposit before performing actions')
              ) {
                toast.info(
                  'Your wallet seems to be new. Please deposit some funds to establish connection.',
                  { id: toastId }
                )
                openDepositModal()
              } else {
                toastSdkError(error, 'Error approving agent', { id: toastId })
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
              toastSdkError(error, 'Error approving fee', { id: toastId })
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
              // R1-UX2: the old copy talked about "deposits", but these two
              // signatures approve the agent wallet and the builder fee —
              // trading enablement, not deposits. New copy matches what the
              // Rabby popup actually shows.
              'Enable one-click trading. Sign twice to approve your agent wallet and set the builder fee. No gas required.'
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
