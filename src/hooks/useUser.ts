'use client'
import { User } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { useConnection } from 'wagmi'

// Hook to fetch user details by wallet_id
export const useUser = () => {
  const { isConnected, address } = useConnection()

  return useQuery({
    queryKey: ['user', address],
    queryFn: async () => {
      if (!address) return null

      const response = await fetch(`/api/users?wallet_id=${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user details')
      }

      const data: User = await response.json()

      // data.rewards_updated_at is more than 24hr old, then fetch the rewards from the api
      if (
        !data.rewards_updated_at ||
        new Date(data.rewards_updated_at).getTime() < Date.now() - 24 * 60 * 60 * 1000
      ) {
        const rewardsResponse = await fetch(`/api/rewards/hl-status`)
        if (!rewardsResponse.ok) {
          throw new Error('Failed to fetch rewards')
        }
      }

      return data
    },
    enabled: isConnected && !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}
