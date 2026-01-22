'use client'
import { useQuery } from '@tanstack/react-query'
import { useConnection } from 'wagmi'
import { RewardsHistoryItem } from '@/services/Rewards.manager'
import { apiServerAxios } from '@/config/axios'

export interface IRewardHistoryResponse {
  success: boolean
  data: {
    rewardsHistory: RewardsHistoryItem[]
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
  const { isConnected, address } = useConnection()
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

      // Use apiServerAxios instead of fetch
      const response = await apiServerAxios.get(`/api/rewards/history?${searchParams.toString()}`)
      if (!response.data) {
        throw new Error('Failed to fetch claim reward history')
      }

      const data: IRewardHistoryResponse = response.data
      return data.data
    },
    enabled: isConnected && !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}
