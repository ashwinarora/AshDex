import { NextRequest, NextResponse } from 'next/server'
import InviteService from '@/services/Invite.manager'
import { Address } from 'viem'
import { AuthenticatedRequest, withAuth } from '@/app/api/middleware'

const fetchInvitesPostHandler = async (request: AuthenticatedRequest) => {
  try {
    const payload = JSON.parse(request.payload as string)
    const inviteCode = payload.inviteCode
    const wallet_id = request.wallet_id as Address

    if (!wallet_id) {
      return NextResponse.json({ error: 'Missing wallet_id parameter' }, { status: 400 })
    }

    // Get user's invites with details
    const invites = await InviteService.getUserInvites(wallet_id, inviteCode)

    if (!invites) {
      return NextResponse.json({
        success: true,
        invites: [],
        stats: {
          totalInvites: 0,
          totalUsed: 0,
          uniqueUsersReferred: 0
        }
      })
    }

    return NextResponse.json({
      success: true,
      invites: invites
    })
  } catch (error) {
    console.error('Error fetching invites:', error)

    if (error instanceof Error) {
      if (error.message === 'User not found') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withAuth(fetchInvitesPostHandler)

// api to get all successful invites for a user
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const wallet_id = searchParams.get('wallet_id') as Address
    if (!wallet_id) {
      return NextResponse.json({ error: 'Missing wallet_id' }, { status: 400 })
    }

    const invites = await InviteService.getInviteByUserWithUsedBy(wallet_id)

    return NextResponse.json({ success: true, invite: invites })
  } catch (error) {
    console.error('Error fetching invites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
