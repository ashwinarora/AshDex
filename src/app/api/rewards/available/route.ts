import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const wallet_id = searchParams.get('wallet_id')
  if (!wallet_id) {
    return NextResponse.json({ error: 'Missing wallet_id parameter' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { wallet_id } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const totalRewardsClaimed = await prisma.userRewardsClaims.aggregate({
    where: { user_id: user.id },
    _sum: { rewards_claimed: true }
  })

  const rewardsClaimed = totalRewardsClaimed._sum.rewards_claimed || Decimal(0)

  // TODO: Get this value from HL
  const totalRewardsGenerated = Decimal(100).div(2)

  const rewardsAvailableToClaim = totalRewardsGenerated.sub(rewardsClaimed)

  return NextResponse.json({ totalRewardsGenerated, rewardsClaimed, rewardsAvailableToClaim })
}
