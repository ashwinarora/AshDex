import { NextResponse } from 'next/server'
import { AuthenticatedRequest, withAuth } from '@/app/api/middleware'
import RewardsManager from '@/services/Rewards.manager'
import { HttpStatusCode } from 'axios'

type ClaimRewardsPayload = {
  action: 'claimRewards'
}

const claimRewardsHandler = async (request: AuthenticatedRequest<ClaimRewardsPayload>) => {
  try {
    const wallet_id = request.wallet_id
    const result = await RewardsManager.claimRewards(wallet_id)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in claim rewards route:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: HttpStatusCode.InternalServerError }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}

export const POST = withAuth<ClaimRewardsPayload>(claimRewardsHandler)
