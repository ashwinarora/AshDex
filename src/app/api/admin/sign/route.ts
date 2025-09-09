// app/api/admin/sign/route.ts
export const runtime = 'nodejs' // ensure Node runtime (not Edge)

import { signData } from '@/services/admin'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Static string to sign
    const messageToSign = 'Hello from Nexon Admin!'

    console.log('Signing message:', messageToSign)

    // Sign the message using AWS KMS
    const signature = await signData(messageToSign)

    return NextResponse.json({
      message: messageToSign,
      signature,
      success: true
    })
  } catch (error) {
    console.error('Signing failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to sign message',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    )
  }
}
