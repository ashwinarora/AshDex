import { NextResponse } from 'next/server'
import { AuthenticatedRequest, withAuth } from '@/app/api/middleware'

const claimRewardsHandler = async (request: AuthenticatedRequest) => {
  // TODO
  
  console.log(request)
  return NextResponse.json({ message: 'Rewards claimed' })
}

export const POST = withAuth(claimRewardsHandler)
