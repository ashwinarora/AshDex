'use client'
import { useAccount } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Hex } from 'viem'

export interface ClaimRewardsResponse {
  success: boolean
  result: unknown
  rewards_claimed: string
  txn_hash: string
  address: string
}

export interface ClaimRewardsParams {
  timestamp: number
  signature: Hex
}

// Hook to claim rewards
export const useClaimRewards = () => {
  const { address } = useAccount()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ timestamp, signature }: ClaimRewardsParams) => {
      if (!address) {
        throw new Error('Wallet not connected')
      }

      const response = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signature,
          payload: { timestamp }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to claim rewards')
      }

      const data: ClaimRewardsResponse = await response.json()
      return data
    },
    onSuccess: (data) => {
      // Invalidate and refetch reward history and related queries
      queryClient.invalidateQueries({ queryKey: ['claimRewardHistory', address] })
      queryClient.invalidateQueries({ queryKey: ['referralsInfo'] })
      toast.success(`Successfully claimed ${data.rewards_claimed} USDC`)
    },
    onError: (error: Error) => {
      console.error('Error claiming rewards:', error)
      toast.error(`Failed to claim rewards: ${error.message}`)
    }
  })
}
