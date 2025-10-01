import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const wallet_id = searchParams.get('wallet_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!wallet_id) {
      return NextResponse.json({ error: 'Missing wallet_id parameter' }, { status: 400 })
    }

    // Find user by wallet_id
    const user = await prisma.user.findUnique({
      where: { wallet_id },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get rewards history with pagination
    const rewardsHistory_promise = prisma.userRewardsClaims.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      take: Math.min(limit, 100), // Cap at 100 records
      skip: offset,
      select: {
        id: true,
        rewards_claimed: true,
        created_at: true,
        updated_at: true
      }
    })

    // Get total count for pagination
    const totalCount_promise = prisma.userRewardsClaims.count({
      where: { user_id: user.id }
    })

    // Calculate total rewards claimed
    const totalRewardsClaimed_promise = prisma.userRewardsClaims.aggregate({
      where: { user_id: user.id },
      _sum: { rewards_claimed: true }
    })

    const [rewardsHistory, totalCount, totalRewardsClaimed] = await Promise.all([
      rewardsHistory_promise,
      totalCount_promise,
      totalRewardsClaimed_promise
    ])

    return NextResponse.json({
      success: true,
      data: {
        rewardsHistory,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        },
        summary: {
          totalRewardsClaimed: totalRewardsClaimed._sum.rewards_claimed || 0,
          totalClaims: totalCount
        }
      }
    })
  } catch (error) {
    console.error('Error fetching rewards history:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
