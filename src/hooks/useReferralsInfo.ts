'use client'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useHyperLiquid } from '@/context/HyperLiquid'
import type { ReferralData } from '@/utils/hyperliquid/hyperLiquidTypes'

export const useReferralsInfo = () => {
  const { hyperliquidAxios } = useHyperLiquid()
  const { isConnected, address } = useAccount()
  return useQuery<ReferralData>({
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
