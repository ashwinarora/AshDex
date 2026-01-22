'use client'
import { useQuery } from '@tanstack/react-query'
import { useConnection } from 'wagmi'
import { hyperliquidAxios } from '@/config/axios'
import * as hl from '@nktkas/hyperliquid'

export const useReferralsInfo = () => {
  const { isConnected, address } = useConnection()
  return useQuery<hl.ReferralResponse>({
    queryKey: ['referralsDetails', address],
    queryFn: async () => {
      const response = await hyperliquidAxios.post('/info', {
        type: 'referral',
        user: address
      })
      return response?.data
    },
    enabled: isConnected && !!address
  })
}
