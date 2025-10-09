import { NextRequest, NextResponse } from 'next/server'
import { Address } from 'viem'
import RewardsManager from '@/services/Rewards.manager'

export const GET = async (request: NextRequest) => {
  try {
    const wallet_id = request.nextUrl.searchParams.get('wallet_id')

    if (!wallet_id) {
      return NextResponse.json({ error: 'Missing wallet_id parameter' }, { status: 400 })
    }

    const rewardsStats = await RewardsManager.getRewardsStats(wallet_id as Address)

    return NextResponse.json(rewardsStats)
  } catch (error) {
    console.error('Error fetching rewards stats:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
