import { NextRequest, NextResponse } from 'next/server'
import { FIBSingleSignOn } from '@/services/FIB.sso'

export async function POST(req: NextRequest) {
  try {
    const { ssoAuthorizationCode } = await req.json()
    if (!ssoAuthorizationCode || typeof ssoAuthorizationCode !== 'string') {
      return NextResponse.json({ message: 'ssoAuthorizationCode is required' }, { status: 400 })
    }

    const res = await FIBSingleSignOn.getUserDetails(ssoAuthorizationCode)
    const json = await res.json()
    return NextResponse.json(json)
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json({ message: 'Failed to fetch user details' }, { status: 500 })
  }
}
