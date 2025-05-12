import { NextRequest, NextResponse } from 'next/server'
import userManager from '@/services/UserManager'

// GET handler to retrieve users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletId = searchParams.get('wallet_id')

    if (!walletId) {
      return NextResponse.json({ error: 'Missing wallet_id parameter' }, { status: 400 })
    }

    const result = await userManager.findUserByWalletId(walletId)

    if (!result) {
      return NextResponse.json({ data: null, message: 'User not found' }, { status: 200 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    if (!userData.wallet_id) {
      return NextResponse.json({ error: 'Wallet ID is required' }, { status: 400 })
    }

    const result = await userManager.createOrUpdateUser(userData)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_id, username, avatar_url, user_preferences } = body

    if (!wallet_id) {
      return NextResponse.json({ error: 'Missing required field: wallet_id' }, { status: 400 })
    }

    const result = await userManager.updateUser(wallet_id, {
      username,
      avatar_url,
      user_preferences
    })

    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user', details: error }, { status: 500 })
  }
}
