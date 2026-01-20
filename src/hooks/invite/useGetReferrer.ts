'use client'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useAuth } from './useAuth'
import { apiServerAxios } from '@/config/axios'

type GetReferrerPayload = { action: 'getReferrer' }

export interface ReferrerData {
  inviteCode: string
  referrer: {
    wallet_id: string
    username: string
  }
}

interface GetReferrerResponse {
  success: boolean
  data: ReferrerData | null
}

export const useGetReferrer = () => {
  const { isConnected, address } = useAccount()
  const authMutation = useAuth<GetReferrerPayload>()

  return useQuery({
    queryKey: ['referrer', address],
    queryFn: async () => {
      if (!address) return null

      const payload: GetReferrerPayload = { action: 'getReferrer' }
      const body = await authMutation({ payload })
      const response = await apiServerAxios.post<GetReferrerResponse>('/api/users/referrer', body)

      if (!response.data.success) {
        throw new Error('Failed to fetch referrer')
      }

      return response.data.data
    },
    enabled: isConnected && !!address,
    staleTime: 1000 * 60 * 5,
    retry: 1
  })
}
