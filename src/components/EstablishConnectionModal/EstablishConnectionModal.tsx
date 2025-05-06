import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useAccount, useSignTypedData } from 'wagmi'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { AGENT_NAME, BUILDER_ADDRESS, BUILDER_FEE } from '@/utils/constants'
import { getApproveAgentPayload } from '@/utils/hyperliquid/ApproveAgent'
import { toast } from 'react-toastify'
import { splitSignature } from '@/utils/utils'
import { useAgentApproval } from '@/context/EstablishConnection'
import { getApproveBuilderFeePayload } from '@/utils/hyperliquid/ApproveBuilderFee'

const EstablishConnectionModal = () => {
  const { chainId } = useAccount()
  const { agentWallet, hyperliquidAxios, isTestnet } = useHyperLiquid()
  const { signTypedDataAsync } = useSignTypedData()
  const [isApproving, setIsApproving] = useState(false)
  const {
    closeModal,
    refetchAgentApproval,
    isAgentApproved,
    currentFeeApproval,
    refetchCurrentFeeApproval
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
        <button
          className="w-full mt-6 text-white cursor-pointer text-base font-semibold bg-[#5F46F9] hover:opacity-90 rounded-2xl px-6 py-3"
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
              if(res.data.status === "err") {
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
        </button>
      )
    }
    if (currentFeeApproval === 0) {
      return (
        <button
          className="w-full mt-6 text-white cursor-pointer text-base font-semibold bg-[#5F46F9] hover:opacity-90 rounded-2xl px-6 py-3"
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
        </button>
      )
    }
    return (
      <button
        className="w-full mt-6 text-white cursor-pointer text-base font-semibold bg-[#5F46F9] hover:opacity-90 rounded-2xl px-6 py-3"
        onClick={closeModal}
      >
        Close
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50  backdrop-blur-sm" onClick={closeModal} />
      {/* Modal Container */}
      <div
        className="relative bg-[#0F0816] border border-white/10 rounded-2xl shadow-lg max-w-md w-full p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col items-start">
              <p className="text-lg text-white font-semibold">Establish Connection</p>
              <p className="text-[#8B8BA0] text-sm mt-1 font-normal mb-3">
                This signature is gas-free. It opens a decentralized channel for instant and gasless
                deposits.
              </p>
            </div>
            <button
              onClick={closeModal}
              className="p-2 bg-white/10 rounded-full text-[#E8E0F1] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* <div className="flex items-center gap-x-1">
            <CheckBox label="" isChecked={stayConnected} setIsChecked={setStayConnected} />
            <span className="text-sm font-normal text-[#E8E0F1]">Stay Connected</span>
          </div> */}
          {getButton()}
        </div>
      </div>
    </div>
  )
}

export default EstablishConnectionModal
