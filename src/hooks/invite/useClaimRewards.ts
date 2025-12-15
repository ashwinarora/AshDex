'use client'
import { useAccount } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from './useAuth'
import { apiServerAxios } from '@/config/axios'

type TClaimRewardsPayload = { action: 'claimRewards' }

export interface ClaimRewardsResponse {
  success: boolean
  result: unknown
  rewards_claimed: string
  txn_hash: string
  address: string
}

// Hook to claim rewards
export const useClaimRewards = () => {
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const authMutation = useAuth<TClaimRewardsPayload>()

  return useMutation({
    mutationFn: async () => {
      const payload: TClaimRewardsPayload = { action: 'claimRewards' }
      const body = await authMutation({ payload })
      const response = await apiServerAxios.post('/api/rewards/claim', body)
      if (!response.data) {
        const errorData = await response.data
        throw new Error(errorData.error || 'Failed to claim rewards')
      }

      const data: ClaimRewardsResponse = await response.data
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
      toast.error('Something went wrong, check the console or contact support')
    }
  })
}
