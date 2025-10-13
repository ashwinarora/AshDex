import { NextResponse } from 'next/server'
import InviteService from '@/services/Invite.manager'
import { Address } from 'viem'
import { AuthenticatedRequest, withAuth } from '@/app/api/middleware'
import { HttpStatusCode } from 'axios'

const createInvitePostHandler = async (request: AuthenticatedRequest) => {
  try {
    // @ts-expect-error we know that payload is there
    const inviteCode = request.payload.inviteCode
    const wallet_id = request.wallet_id as Address

    // Validate required fields
    if (!inviteCode) {
      return NextResponse.json({ error: 'Missing required invite code' }, { status: 400 })
    }

    const currInviteCodes = await InviteService.getInviteByUser(wallet_id)
    if (currInviteCodes && currInviteCodes.length > 0) {
      return NextResponse.json(
        { error: 'User already has an invite code', data: currInviteCodes },
        { status: HttpStatusCode.NotAcceptable }
      )
    }

    // Create the invite
    const invite = await InviteService.createInvite(wallet_id, inviteCode)

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        code: invite.code,
        created_at: invite.created_at
      }
    })
  } catch (error) {
    console.error('Error creating invite:', error)

    if (error instanceof Error) {
      if (error.message === 'User not found') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error', message: error }, { status: 500 })
  }
}

// api to create invite code for a user
export const POST = withAuth(createInvitePostHandler)
