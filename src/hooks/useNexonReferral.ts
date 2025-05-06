import { useHyperLiquid } from "@/context/HyperLiquid"
import { ReferralData } from "@/utils/hyperliquid/hyperLiquidTypes"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { useAccount } from "wagmi"
import { NEXON_REFERRAL_CODE } from "@/utils/constants"
import { useAgentApproval } from "@/context/EstablishConnection"

export const useNexonReferral = () => {
  const { hyperliquidAxios, clearingHouseState, sdk } = useHyperLiquid()
  const { isConnected, address } = useAccount()
  const { isAgentApproved } = useAgentApproval()

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

    const setNexonReferral = async () => {
      console.log('setting nexon referral')
      const res = await sdk.exchange.setReferrer(NEXON_REFERRAL_CODE)
      console.log(res)
    }

    setNexonReferral()
  }, [referralData, clearingHouseState, isAgentApproved])

  return null
}