import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

interface UserPreferences {
  popup_position?: number
  sound_enabled?: boolean
  order_updates?: boolean
  liquidation_alerts?: boolean
  new_feature_updates?: boolean
  new_token_listings?: boolean
  vaults_distribution_updates?: boolean
  rewards_referrals_updates?: boolean
  security_alerts?: boolean
}

interface UserData {
  username?: string
  avatar_url?: string
  wallet_id: string
  user_preferences?: UserPreferences
}

// GET handler to retrieve users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletId = searchParams.get('wallet_id')

    if (!walletId) {
      return NextResponse.json({ error: 'Missing wallet_id parameter' }, { status: 400 })
    }

    // Use the tagged template literal with parameter substitution
    const result = await prisma.user.findFirst({
      where: {
        wallet_id: walletId
      }
    })

    console.log(result, 'result USer')
    if (!result) {
      // Return a 200 status with null data instead of a 404
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
    const userData: UserData = await request.json()

    // Validate required fields
    if (!userData.wallet_id) {
      return NextResponse.json({ error: 'Wallet ID is required' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        wallet_id: userData.wallet_id
      }
    })

    let result

    if (existingUser) {
      // Update existing user
      result = await prisma.user.updateMany({
        where: {
          wallet_id: userData.wallet_id
        },
        data: {
          username: userData.username,
          avatar_url: userData.avatar_url ? parseInt(userData.avatar_url) : undefined,
          user_preferences: userData.user_preferences as Prisma.InputJsonValue
        }
      })

      // Get the updated user
      result = await prisma.user.findFirst({
        where: {
          wallet_id: userData.wallet_id
        }
      })
    } else {
      // Create new user
      result = await prisma.user.create({
        data: {
          wallet_id: userData.wallet_id,
          username: userData.username || '',
          avatar_url: userData.avatar_url ? parseInt(userData.avatar_url) : null,
          user_preferences: userData.user_preferences as Prisma.InputJsonValue
        }
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_id, username, avatar_url, preferred_language_id, user_preferences } = body

    if (!wallet_id) {
      return NextResponse.json({ error: 'Missing required field: wallet_id' }, { status: 400 })
    }

    // Update user using Prisma
    await prisma.user.updateMany({
      where: {
        wallet_id: wallet_id
      },
      data: {
        ...(username !== undefined && { username }),
        ...(avatar_url !== undefined && { avatar_url: parseInt(avatar_url) }),
        ...(preferred_language_id !== undefined && { preferred_language_id }),
        ...(user_preferences !== undefined && {
          user_preferences: user_preferences as Prisma.InputJsonValue
        })
      }
    })

    // Get the updated user
    const result = await prisma.user.findFirst({
      where: {
        wallet_id: wallet_id
      }
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
