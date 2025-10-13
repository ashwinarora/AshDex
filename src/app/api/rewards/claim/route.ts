import { NextResponse } from 'next/server'
import { AuthenticatedRequest, withAuth } from '@/app/api/middleware'
import { Address } from 'viem'
import RewardsManager from '@/services/Rewards.manager'

type ClaimRewardsPayload = {
  claimAmount: string
}

const claimRewardsHandler = async (request: AuthenticatedRequest<ClaimRewardsPayload>) => {
  try {
    const wallet_id = request.wallet_id as Address
    const claimAmount = request.payload.claimAmount

    if (!claimAmount) {
      return NextResponse.json({ error: 'Missing claimAmount in payload' }, { status: 400 })
    }

    const result = await RewardsManager.claimRewards({
      wallet_id,
      claimAmount
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in claim rewards route:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withAuth<ClaimRewardsPayload>(claimRewardsHandler)
