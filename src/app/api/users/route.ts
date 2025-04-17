import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { NEON_DATABASE_URL } from '@/utils/constants'
import { sql } from '@vercel/postgres'

const sqlNeon = neon(NEON_DATABASE_URL)

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
    const result = await sqlNeon`
        SELECT * FROM users WHERE wallet_id = ${walletId}
      `

    if (result.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
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

    // Update or insert user
    const result = await sql`
      INSERT INTO users (username, avatar_url, wallet_id, user_preferences)
      VALUES (${userData.username}, ${userData.avatar_url}, ${userData.wallet_id}, ${JSON.stringify(userData.user_preferences)})
      ON CONFLICT (wallet_id) 
      DO UPDATE SET
        username = EXCLUDED.username,
        avatar_url = EXCLUDED.avatar_url,
        user_preferences = EXCLUDED.user_preferences
      RETURNING *
    `

    return NextResponse.json(result.rows[0])
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

    const updates = []

    if (username !== undefined) {
      updates.push(sqlNeon`username = ${username}`)
    }

    if (avatar_url !== undefined) {
      updates.push(sqlNeon`avatar_url = ${avatar_url}`)
    }

    if (preferred_language_id !== undefined) {
      updates.push(sqlNeon`preferred_language_id = ${preferred_language_id}`)
    }

    if (user_preferences !== undefined) {
      updates.push(sqlNeon`user_preferences = ${JSON.stringify(user_preferences)}`)
    }

    // Always update updated_at
    updates.push(sqlNeon`updated_at = NOW()`)

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Combine updates with commas between them using reduce
    const setClause = updates.reduce((acc, val, i) => (i === 0 ? val : sqlNeon`${acc}, ${val}`))

    const result = await sqlNeon`
        UPDATE users
        SET ${setClause}
        WHERE wallet_id = ${wallet_id}
        RETURNING *
      `

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user', details: error }, { status: 500 })
  }
}
