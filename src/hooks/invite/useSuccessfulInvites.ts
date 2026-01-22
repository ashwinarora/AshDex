'use client'
import { useQuery } from '@tanstack/react-query'
import { useConnection } from 'wagmi'
import { IInviteWithUsedBy } from '@/services/Invite.manager'
import { apiServerAxios } from '@/config/axios'

export interface ISuccessfulInviteResponse {
  success: boolean
  invite: IInviteWithUsedBy[]
}

// Hook to get all successful invites for a user
export const useSuccessfulInvites = () => {
  const { isConnected, address } = useConnection()

  return useQuery({
    queryKey: ['successfulInvites', address],
    queryFn: async () => {
      if (!address) return null

      const response = await apiServerAxios.get(`/api/invite?wallet_id=${address}`)
      if (!response.data) {
        throw new Error('Failed to fetch successful invites')
      }

      const data: ISuccessfulInviteResponse = response.data
      console.log('data for successful invites', data)
      return data.invite
    },
    enabled: isConnected && !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}
