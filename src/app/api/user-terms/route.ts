import { NextRequest, NextResponse } from 'next/server'
import TermsManager from '@/services/TermsManager'

interface UserTermsRequest {
  wallet_id: string
}

export async function GET(request: NextRequest) {
  try {
    // Parse the request body to get the wallet_id
    const body = (await request.json()) as UserTermsRequest
    const { wallet_id } = body

    if (!wallet_id) {
      return NextResponse.json({ error: 'wallet_id is required' }, { status: 400 })
    }

    // Check if the user has signed the latest terms
    const hasSigned = await TermsManager.hasUserSignedLatestTerms(wallet_id)

    return NextResponse.json({ signed: hasSigned })
  } catch (error) {
    console.error('Error checking user terms signature:', error)
    return NextResponse.json({ error: 'Failed to check user terms signature' }, { status: 500 })
  }
}
