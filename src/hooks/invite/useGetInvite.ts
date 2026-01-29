'use client'
import { useQuery } from '@tanstack/react-query'
import { useConnection } from 'wagmi'
import { useAuth } from './useAuth'
import { apiServerAxios } from '@/config/axios'

type GetInvitePayload = { action: 'getReferrer' }

export interface ReferrerData {
  inviteCode: string
  referrer: {
    wallet_id: string
    username: string
  }
}

interface GetInviteResponse {
  success: boolean
  data: ReferrerData | null
}

export const useGetInvite = () => {
  const { isConnected, address } = useConnection()
  const authMutation = useAuth<GetInvitePayload>()

  return useQuery({
    queryKey: ['inviteCode', address],
    queryFn: async () => {
      if (!address) return null

      const payload: GetInvitePayload = { action: 'getReferrer' }
      const body = await authMutation({ payload })
      const response = await apiServerAxios.post<GetInviteResponse>('/api/users/referrer', body)

      if (!response.data.success) {
        throw new Error('Failed to fetch invite code')
      }

      return response.data.data
    },
    enabled: isConnected && !!address,
    staleTime: 1000 * 60 * 5,
    retry: 1
  })
}
