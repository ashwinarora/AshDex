import type { InfoClient } from '@nktkas/hyperliquid'

type ReferralResponse = Awaited<ReturnType<InfoClient['referral']>>

export function shouldSetReferrer(args: {
  code: string
  isAgentApproved: boolean
  referral: ReferralResponse | undefined
}): boolean {
  const { code, isAgentApproved, referral } = args
  if (!code) return false
  if (!isAgentApproved) return false
  if (!referral) return false
  if (referral.referredBy) return false
  if (referral.referrerState?.stage === 'needToCreateCode') return false
  return true
}
