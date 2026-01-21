import { Address, Hex } from 'viem'
import * as hl from '@nktkas/hyperliquid'

export interface IGetReferralResponse {
  referrer: Hex
  code: string
}

export async function getReferral(user: Address): Promise<IGetReferralResponse | null> {
  const transport = new hl.HttpTransport({
    isTestnet: process.env.NEXT_PUBLIC_HYPERLIQUID_NETWORK != 'mainnet'
  })

  const sdkInfoClient = new hl.InfoClient({ transport })
  const referral = await sdkInfoClient?.referral({ user })

  if (!referral) {
    throw new Error('Referral not found on HL')
  }

  const referralData = referral.referredBy

  return referralData
}
