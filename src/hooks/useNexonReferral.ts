import { ReferralData } from '@/utils/hyperliquid/hyperLiquidTypes'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { NEXON_REFERRAL_CODE } from '@/utils/constants'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { hyperliquidAxios } from '@/config/axios'

export const useNexonReferral = () => {
  const { clearingHouseState, sdk } = useHyperliquid()
  const { isConnected, address } = useAccount()
  const { isAgentApproved } = useAgentApproval()
  const [isReferralSet, setIsReferralSet] = useState(false)

  const { data: referralData } = useQuery<ReferralData>({
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

  useEffect(() => {
    if (!isAgentApproved) return
    if (!referralData) return
    if (!clearingHouseState) return
    if (!clearingHouseState.withdrawable) return
    if (referralData.referredBy) return
    if (referralData.referrerState.stage === 'needToCreateCode') return
    if (isReferralSet) return

    const setNexonReferral = async () => {
      if (!sdk) return
      await sdk.exchange.setReferrer(NEXON_REFERRAL_CODE)
      setIsReferralSet(true)
    }

    setNexonReferral()
  }, [referralData, clearingHouseState, isAgentApproved])

  return null
}
