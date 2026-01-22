import { NextResponse } from 'next/server'
import { AuthenticatedRequest, withAuth } from '@/app/api/middleware'
import InviteService from '@/services/Invite.manager'
import UserManager from '@/services/User.manager'

type InviteAcceptPayload = { inviteCode: string; action: 'acceptInvite' }

const PatchHandler = async (request: AuthenticatedRequest<InviteAcceptPayload>) => {
  const inviteCode = request.payload.inviteCode

  const wallet_id = request.wallet_id

  try {
    // This is to check if the user is nexon referred or not.
    const referralStatus = await UserManager.getReferralStatus(wallet_id, true)

    if (!referralStatus) {
      return NextResponse.json(
        { message: 'User is not nexon referred', error: 'User is not nexon referred' },
        { status: 400 }
      )
    }

    await InviteService.claimInviteCode(wallet_id, inviteCode)
    return NextResponse.json({ message: 'Invite code claimed' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Invite code not claimed', error: (error as Error).message },
      { status: 400 }
    )
  }
}

export const PATCH = withAuth<InviteAcceptPayload>(PatchHandler)
