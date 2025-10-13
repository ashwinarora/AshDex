import { NextRequest, NextResponse } from 'next/server'
import { getAuthMasterAccount } from '@/lib/auth'
import type { Signature } from 'viem'

export interface AuthenticatedRequest<TPayload> extends NextRequest {
  wallet_id: string
  payload: TPayload
}

// Middleware wrapper to authenticate requests
// puts wallet_id and payload in the request object
// works with requests which have body
export function withAuth<TPayload>(handler: (request: AuthenticatedRequest<TPayload>) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { signature, payload } = body as { signature?: Signature; payload?: TPayload }

      if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
      } else if (!payload) {
        return NextResponse.json({ error: 'Missing payload' }, { status: 400 })
      }

      const masterAccount = await getAuthMasterAccount(JSON.stringify(payload), signature)
      console.log('🚀 ~ withAuth ~ masterAccount:', masterAccount)

      // Create authenticated request with wallet_id
      const authenticatedRequest = request as AuthenticatedRequest<TPayload>
      authenticatedRequest.wallet_id = masterAccount
      authenticatedRequest.payload = payload

      return handler(authenticatedRequest)
    } catch (error) {
      console.error('Error verifying signature:', error)
      return NextResponse.json({ error: 'Invalid signature', message: error }, { status: 401 })
    }
  }
}
