import { NextRequest, NextResponse } from 'next/server'
import TermsManager from '@/services/Terms.manager'
import { verifyMessage } from 'viem'

export async function GET(request: NextRequest) {
  try {
    // Get the wallet_id from query params
    const { searchParams } = new URL(request.url)
    const wallet_id = searchParams.get('wallet_id')

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

export async function POST(request: NextRequest) {
  try {
    const { wallet_id, signature } = await request.json()

    if (!wallet_id || !signature) {
      return NextResponse.json({ error: 'wallet_id and signature are required' }, { status: 400 })
    }

    const hasSigned = await TermsManager.hasUserSignedLatestTerms(wallet_id)

    if (hasSigned) {
      return NextResponse.json(
        { error: 'User has already signed the latest terms' },
        { status: 400 }
      )
    }

    const latestTerms = await TermsManager.getLatestTerms()

    if (!latestTerms) {
      return NextResponse.json({ error: 'Latest terms not found' }, { status: 400 })
    }

    const verified = await verifyMessage({
      message: latestTerms.content,
      signature: signature,
      address: wallet_id
    })

    if (!verified) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const userTermsSignature = await TermsManager.createUserTermsSignature(
      wallet_id,
      latestTerms.id,
      signature
    )

    return NextResponse.json({ success: true, userTermsSignature })
  } catch (error) {
    console.error('Error checking user terms signature:', error)
    return NextResponse.json({ error: 'Failed to check user terms signature' }, { status: 500 })
  }
}
