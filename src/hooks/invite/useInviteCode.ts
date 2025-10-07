'use client'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
export interface IInvite {
  id: number
  user_id: number
  code: string
  created_at: string
  updated_at: string
}

export interface IInviteResponse {
  invite: IInvite[]
}

// Hook to get existing invite code
export const useInviteCode = () => {
  const { isConnected, address } = useAccount()

  return useQuery({
    queryKey: ['inviteCode', address],
    queryFn: async () => {
      if (!address) return null

      const response = await fetch(`/api/invite?wallet_id=${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch invite code')
      }

      const data: IInviteResponse = await response.json()
      console.log('data for existing invite code', data)
      return data.invite[0].code
    },
    enabled: isConnected && !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}
