// app/api/admin/verify/route.ts
export const runtime = 'nodejs' // ensure Node runtime (not Edge)

import { verifySignature } from '@/services/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, signature } = body

    // Validate input
    if (!message || !signature) {
      return NextResponse.json(
        {
          error: 'Missing required fields: message and signature',
          success: false
        },
        { status: 400 }
      )
    }

    // Verify the signature
    const isValid = await verifySignature(message, signature)

    return NextResponse.json({
      message,
      signature,
      isValid,
      success: true
    })
  } catch (error) {
    console.error('Verification failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to verify signature',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    )
  }
}
