import { NextResponse } from 'next/server'
import { AuthenticatedRequest, withAuth } from '@/app/api/middleware'
import { Address } from 'viem'
import RewardsManager from '@/services/Rewards.manager'

const claimRewardsHandler = async (request: AuthenticatedRequest) => {
  try {
    const wallet_id = request.wallet_id as Address
    // @ts-expect-error payload is not typed
    const claimAmount = request.payload.claimAmount as string

    if (!claimAmount) {
      return NextResponse.json({ error: 'Missing claimAmount in payload' }, { status: 400 })
    }

    const result = await RewardsManager.claimRewards({
      wallet_id,
      claimAmount: claimAmount
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

export const POST = withAuth(claimRewardsHandler)
