import { NextResponse } from 'next/server'
import { AuthenticatedRequest, withAuth } from '@/app/api/middleware'
import { prisma } from '@/lib/prisma'
import { Address } from 'viem'

const claimRewardsHandler = async (request: AuthenticatedRequest) => {
  const wallet_id = request.wallet_id as Address
  const payload = JSON.parse(request.payload as string)
  const claimAmount = payload.claimAmount

  const user = await prisma.user.findUnique({ where: { wallet_id } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // 1. check if claimAmount is correct TODO

  // 2. let user claim the amount using kms TODO
  // const { txnHash } = await claimRewardsUsingKMS(wallet_id, claimAmount)
  const txnHash = '0x1234567890' // Dummy

  // 3. save the txnHash and the claim amount in the db
  const saved_response = await prisma.userRewardsClaims.create({
    data: {
      user_id: user.id,
      rewards_claimed: claimAmount,
      txn_hash: txnHash
    }
  })

  return NextResponse.json({ message: 'Rewards claimed', data: saved_response })
}

export const POST = withAuth(claimRewardsHandler)
