import { prisma } from '@/lib/prisma'
import hlService from '@/services/hl.service'
import { NextResponse } from 'next/server'
import { Address } from 'viem'

export const GET = async () => {
  const NEXON_USER = process.env.NEXON_USER_ADDRESS
  if (!NEXON_USER) {
    return NextResponse.json({ error: 'NEXON_USER_ADDRESS is not set' }, { status: 500 })
  }
  const referralStates = await hlService.getReferralStates(NEXON_USER as Address)

  const all_rewards: { address: Address; rewards: number }[] = referralStates.map((state) => ({
    address: state.user as Address,
    rewards: parseFloat(state.cumFeesRewardedToReferrer) / 2
  }))

  console.log('all_rewards', all_rewards)

  // update all users with their respective reward values in a transaction
  await prisma.$transaction(
    all_rewards.map((reward) =>
      prisma.user.updateMany({
        where: {
          wallet_id: {
            equals: reward.address,
            mode: 'insensitive'
          }
        },
        data: {
          rewards_generated: reward.rewards,
          rewards_updated_at: new Date()
        }
      })
    )
  )

  return NextResponse.json({ success: true, updated: all_rewards.length })
}
