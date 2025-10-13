import { NextResponse } from 'next/server'
import { AuthenticatedRequest, withAuth } from '@/app/api/middleware'
import { Address } from 'viem'
import InviteService from '@/services/Invite.manager'

type InviteAcceptPayload = { inviteCode: string }

const PatchHandler = async (request: AuthenticatedRequest<InviteAcceptPayload>) => {
  const inviteCode = request.payload.inviteCode
  const wallet_id = request.wallet_id as Address

  try {
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
