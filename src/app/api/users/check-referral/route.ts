//  A api to validate nexon-referral

import UserManager from '@/services/User.manager'
import { Address } from 'viem'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (request: NextRequest) => {
  const wallet_id = request.nextUrl.searchParams.get('wallet_id') as Address
  const validate = request.nextUrl.searchParams.get('validate') === 'true'

  if (!wallet_id) {
    return NextResponse.json({ error: 'Wallet ID is required' }, { status: 400 })
  }

  const referralStatus = await UserManager.getReferralStatus(wallet_id, validate)

  return NextResponse.json({ referralStatus })
}
