'use client'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'

export interface IRewardHistoryItem {
  id: number
  rewards_claimed: number
  created_at: Date
}

export interface IRewardHistoryResponse {
  success: boolean
  data: {
    rewardsHistory: IRewardHistoryItem[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
    summary: {
      totalRewardsClaimed: number
      totalClaims: number
    }
  }
}

export interface UseClaimRewardHistoryParams {
  limit?: number
  offset?: number
}

// Hook to get claim reward history for a user
export const useGetClaimRewardHistory = (params?: UseClaimRewardHistoryParams) => {
  const { isConnected, address } = useAccount()
  const limit = params?.limit || 50
  const offset = params?.offset || 0

  return useQuery({
    queryKey: ['claimRewardHistory', address, limit, offset],
    queryFn: async () => {
      if (!address) return null

      const searchParams = new URLSearchParams({
        wallet_id: address,
        limit: limit.toString(),
        offset: offset.toString()
      })

      const response = await fetch(`/api/rewards/history?${searchParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch claim reward history')
      }

      const data: IRewardHistoryResponse = await response.json()
      return data.data
    },
    enabled: isConnected && !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}
