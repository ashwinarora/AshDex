'use client'
import { useQuery } from '@tanstack/react-query'
import { useConnection } from 'wagmi'
import { ReferralStats } from '@/services/Rewards.manager'

// Hook to get rewards statistics for a user
export const useGetRewardsStats = () => {
  const { isConnected, address } = useConnection()

  return useQuery({
    queryKey: ['rewardsStats', address],
    queryFn: async () => {
      if (!address) return null

      const searchParams = new URLSearchParams({
        wallet_id: address
      })

      const response = await fetch(`/api/rewards?${searchParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch rewards stats')
      }

      const data: ReferralStats = await response.json()
      return data
    },
    enabled: isConnected && !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}
