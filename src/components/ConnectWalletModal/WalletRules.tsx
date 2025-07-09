'use client'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useSignMessage } from 'wagmi'
import axios from 'axios'
import { useTermsSignature } from '@/hooks/useTermsSignature'
import { toast } from 'sonner'

interface WalletRulesProps {
  onClose: () => void
}

const WalletRules: React.FC<WalletRulesProps> = ({ onClose }) => {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const {
    data: terms,
    isLoading,
    error
  } = useQuery({
    queryKey: ['latestTerms'],
    queryFn: async () => {
      const response = await fetch('/api/latest-terms')
      if (!response.ok) {
        throw new Error('Failed to fetch terms')
      }
      return response.json()
    }
  })
  const { refetch: refetchUserTerms } = useTermsSignature()

  if (isLoading) {
    return (
      <div className="mt-2 max-w-md w-full rounded-2xl flex flex-col items-center justify-center py-10">
        <div className="flex items-center justify-center">
          <span className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="mt-2 max-w-md w-full rounded-2xl text-red-500">Error loading terms</div>
  }

  return (
    <div className="mt-2 max-w-md w-full rounded-2xl">
      {/* Scrollable Content */}
      <div className="max-h-60 overflow-y-auto text-sm text-[#E8E0F1] space-y-4 pr-2">
        {terms?.content}
      </div>

      <div className="mt-6 flex flex-col space-y-3">
        <button
          className="w-full py-3 text-sm rounded-xl text-white font-bold bg-primary cursor-pointer"
          onClick={async () => {
            if (!terms?.content) return
            const signature = await signMessageAsync({
              message: terms.content
            })
            console.log('signature', signature)
            const toastId = toast.loading('Verifying Signature...')
            try {
              const res = await axios.post('/api/user-terms', {
                wallet_id: address,
                signature: signature
              })
              console.log('terms res', res)
              await refetchUserTerms()
              toast.success('Signature verified', {
                id: toastId
              })
            } catch (err) {
              toast.error('Failed to sign and verify terms. Please try again.', {
                id: toastId
              })
              console.log('Error signing/verifying terms:', err)
            }
          }}
        >
          I agree to the Rules
        </button>
        <button
          className="w-full py-2 font-medium rounded-xl bg-secondary hover:bg-[#36303B] text-[#8B8BA0] cursor-pointer"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default WalletRules
