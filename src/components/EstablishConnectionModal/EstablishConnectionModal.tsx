import React, { useEffect, useState } from 'react'
import { useAccount, useSignTypedData } from 'wagmi'
import { AGENT_NAME, BUILDER_ADDRESS, BUILDER_FEE, isTestnet } from '@/utils/constants'
import { getApproveAgentPayload } from '@/utils/hyperliquid/ApproveAgent'
import { toast } from 'react-toastify'
import { splitSignature } from '@/utils/utils'
import { useAgentApproval } from '@/context/EstablishConnection'
import { getApproveBuilderFeePayload } from '@/utils/hyperliquid/ApproveBuilderFee'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { hyperliquidAxios } from '@/config/axios'
import { Dialog } from '@radix-ui/react-dialog'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { useShallow } from 'zustand/react/shallow'

const EstablishConnectionModal = () => {
  const { chainId } = useAccount()
  const { agentWallet } = useHyperliquidStore(
    useShallow((state) => ({
      agentWallet: state.agentWallet
    }))
  )
  const { signTypedDataAsync } = useSignTypedData()
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
            const payload = getApproveAgentPayload({
              agentAddress: agentWallet?.address || '',
              agentName: AGENT_NAME,
              chainId: chainId,
              isTestnet: isTestnet,
              nonce: Date.now()
            })
            const sign = await signTypedDataAsync(payload)
            const toastId = toast.loading('⏳ Approving agent…')
            try {
              const body = {
                action: {
                  type: payload.message.type,
                  agentAddress: payload.message.agentAddress,
                  agentName: payload.message.agentName,
                  nonce: payload.message.nonce,
                  signatureChainId: payload.message.signatureChainId,
                  hyperliquidChain: payload.message.hyperliquidChain
                },
                nonce: payload.message.nonce,
                signature: splitSignature(sign)
              }
              const res = await hyperliquidAxios.post('/exchange', body)
              if (res.data.status === 'err') {
                toast.update(toastId, {
                  render: '❌' + res.data.response,
                  type: 'error',
                  isLoading: false,
                  autoClose: 4000
                })
                return
              }
              await refetchAgentApproval()
              setIsApproving(true)
              toast.update(toastId, {
                render: '✅ Agent approved successfully',
                type: 'success',
                isLoading: false,
                autoClose: 2000
              })
            } catch (error) {
              console.error('Error approving agent:', error)
              toast.update(toastId, {
                render: '❌' + error,
                type: 'error',
                isLoading: false,
                autoClose: 2000
              })
            }
          }}
        >
          Establish Connection
        </Button>
      )
    }
    if (currentFeeApproval === 0) {
      return (
        <Button
          variant={'default'}
          onClick={async () => {
            if (!chainId) return
            const payload = getApproveBuilderFeePayload({
              chainId: chainId,
              isTestnet: isTestnet,
              builder: BUILDER_ADDRESS,
              nonce: Date.now(),
              feePercentage: BUILDER_FEE
            })
            const sign = await signTypedDataAsync(payload)
            const toastId = toast.loading('⏳ Approving fee…')
            try {
              const body = {
                action: {
                  type: payload.message.type,
                  builder: payload.message.builder,
                  maxFeeRate: payload.message.maxFeeRate,
                  nonce: payload.message.nonce,
                  signatureChainId: payload.message.signatureChainId,
                  hyperliquidChain: payload.message.hyperliquidChain
                },
                nonce: payload.message.nonce,
                signature: splitSignature(sign)
              }
              await hyperliquidAxios.post('/exchange', body)
              await refetchCurrentFeeApproval()
              toast.update(toastId, {
                render: '✅ Fee approved successfully',
                type: 'success',
                isLoading: false,
                autoClose: 2000
              })
            } catch (error) {
              console.error('Error approving agent:', error)
              toast.update(toastId, {
                render: '❌' + error,
                type: 'error',
                isLoading: false,
                autoClose: 2000
              })
            }
          }}
        >
          Approve Fee
        </Button>
      )
    }
    return (
      <Button variant={'outline'} onClick={closeModal}>
        Close
      </Button>
    )
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Establish Connection</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          This signature is gas-free. It opens a decentralized channel for instant and gasless
          deposits.
        </DialogDescription>
        {getButton()}
      </DialogContent>
    </Dialog>
  )
}

export default EstablishConnectionModal
