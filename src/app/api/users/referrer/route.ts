import { NextResponse } from 'next/server'
import { AuthenticatedRequest, withAuth } from '@/app/api/middleware'
import UserManager from '@/services/User.manager'

type GetReferrerPayload = { action: 'getReferrer' }

const GetHandler = async (request: AuthenticatedRequest<GetReferrerPayload>) => {
  const wallet_id = request.wallet_id

  try {
    const referrer = await UserManager.getReferrer(wallet_id)
    return NextResponse.json({ success: true, data: referrer })
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 })
  }
}

export const POST = withAuth<GetReferrerPayload>(GetHandler)
