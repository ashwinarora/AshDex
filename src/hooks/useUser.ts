'use client'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'

export interface IUser {
  id: number
  wallet_id: string
  username: string
  avatar_url: number | null
  created_at: string
  updated_at: string
  invited_by: number | null
  is_nexon_referred: boolean
}

// Hook to fetch user details by wallet_id
export const useUser = () => {
  const { isConnected, address } = useAccount()

  return useQuery({
    queryKey: ['user', address],
    queryFn: async () => {
      if (!address) return null

      const response = await fetch(`/api/users?wallet_id=${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user details')
      }

      const data: IUser = await response.json()
      return data
    },
    enabled: isConnected && !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}
