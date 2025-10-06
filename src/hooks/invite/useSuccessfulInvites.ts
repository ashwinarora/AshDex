'use client'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { IInviteWithUsedBy } from '@/services/Invite.manager'

export interface ISuccessfulInviteResponse {
  success: boolean
  invite: IInviteWithUsedBy[]
}

// Hook to get all successful invites for a user
export const useSuccessfulInvites = () => {
  const { isConnected, address } = useAccount()

  return useQuery({
    queryKey: ['successfulInvites', address],
    queryFn: async () => {
      if (!address) return null

      const response = await fetch(`/api/invite?wallet_id=${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch successful invites')
      }

      const data: ISuccessfulInviteResponse = await response.json()
      console.log('data for successful invites', data)
      return data.invite
    },
    enabled: isConnected && !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}
