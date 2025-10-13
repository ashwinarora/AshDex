import { NextResponse } from 'next/server'
import { AuthenticatedRequest, withAuth } from '@/app/api/middleware'
import { Address } from 'viem'
import RewardsManager from '@/services/Rewards.manager'
import { HttpStatusCode } from 'axios'
import { minutesToMilliseconds } from 'date-fns'

const claimRewardsHandler = async (request: AuthenticatedRequest) => {
  try {
    const wallet_id = request.wallet_id as Address
    // @ts-expect-error payload is not typed
    const timestamp = request.payload.timestamp as number

    if (!timestamp) {
      return NextResponse.json(
        { error: 'Missing timestamp in payload' },
        { status: HttpStatusCode.BadRequest }
      )
    }

    if (timestamp < Date.now() - minutesToMilliseconds(5)) {
      return NextResponse.json(
        { error: 'Timestamp is too old' },
        { status: HttpStatusCode.BadRequest }
      )
    }

    const result = await RewardsManager.claimRewards(wallet_id)

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
