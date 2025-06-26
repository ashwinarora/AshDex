'use client'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { hyperliquidAxios } from '@/config/axios'
import { Referral } from '@nktkas/hyperliquid'

export const useReferralsInfo = () => {
  const { isConnected, address } = useAccount()
  return useQuery<Referral>({
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
