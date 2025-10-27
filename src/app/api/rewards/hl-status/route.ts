import hlService from '@/services/hl.service'
import RewardsManager from '@/services/Rewards.manager'
import { NextResponse } from 'next/server'

export const GET = async () => {
  try {
    const referralStates = await hlService.getReferralStates()
    const result = await RewardsManager.syncRewardsFromHyperliquid(referralStates)

    return NextResponse.json({ success: true, updated: result.updated })
  } catch (error) {
    console.error('Error syncing rewards from Hyperliquid:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
