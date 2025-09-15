import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { Address, Hex } from 'viem'

export interface IGetReferralResponse {
  referrer: Hex
  code: string
}

export async function getReferral(user: Address): Promise<IGetReferralResponse | null> {
  const { sdkInfoClient } = useHyperliquidStore.getState()

  const referral = await sdkInfoClient?.referral({ user })

  if (!referral) {
    throw new Error('Referral not found on HL')
  }

  const referralData = referral.referredBy

  return referralData
}
