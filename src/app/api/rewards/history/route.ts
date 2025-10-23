import { NextRequest, NextResponse } from 'next/server'
import { Address } from 'viem'
import RewardsManager from '@/services/Rewards.manager'
import { RewardsHistoryResult } from '@/services/Rewards.manager'

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const wallet_id = searchParams.get('wallet_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!wallet_id) {
      return NextResponse.json({ error: 'Missing wallet_id parameter' }, { status: 400 })
    }

    const data: RewardsHistoryResult = await RewardsManager.getRewardsHistory({
      wallet_id: wallet_id as Address,
      limit,
      offset
    })

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error fetching rewards history:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
