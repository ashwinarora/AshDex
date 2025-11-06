import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { NEXON_REFERRAL_CODE } from '@/utils/constants'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { hyperliquidAxios } from '@/config/axios'
import * as hl from '@nktkas/hyperliquid'

export const useNexonReferral = () => {
  const { clearingHouseState, sdkL1ActionClient } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState,
      sdkL1ActionClient: state.sdkL1ActionClient
    }))
  )
  const { isConnected, address } = useAccount()
  const { isAgentApproved } = useAgentApproval()
  const [isReferralSet, setIsReferralSet] = useState(false)

  const { data: referralData } = useQuery<hl.ReferralResponse>({
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
    if (
      referralData.referrerState.stage === 'ready' &&
      referralData.referrerState.data.code === NEXON_REFERRAL_CODE
    )
      return // cannot refer to self
    if (isReferralSet) return

    const setNexonReferral = async () => {
      if (!sdkL1ActionClient) return
      await sdkL1ActionClient.setReferrer({
        code: NEXON_REFERRAL_CODE
      })
      setIsReferralSet(true)
    }

    setNexonReferral()
  }, [referralData, clearingHouseState, isAgentApproved])

  return null
}
