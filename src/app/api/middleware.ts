import { NextRequest, NextResponse } from 'next/server'
import { getAuthMasterAccount } from '@/lib/auth'
import UserManager from '@/services/User.manager'
import { HttpStatusCode } from 'axios'

export interface AuthenticatedRequest extends NextRequest {
  wallet_id: string
  payload: string
}

// Middleware wrapper to authenticate requests
// puts wallet_id and payload in the request object
// works with requests which have body
export function withAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { signature, payload } = body

      if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
      } else if (!payload) {
        return NextResponse.json({ error: 'Missing payload' }, { status: 400 })
      }

      const masterAccount = await getAuthMasterAccount(JSON.stringify(payload), signature)
      console.log('🚀 ~ withAuth ~ masterAccount:', masterAccount)

      const user = await UserManager.findUserByWalletId(masterAccount)
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: HttpStatusCode.NotFound })
      }

      // Create authenticated request with wallet_id
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.wallet_id = masterAccount
      authenticatedRequest.payload = payload

      return handler(authenticatedRequest)
    } catch (error) {
      console.error('Error verifying signature:', error)
      return NextResponse.json({ error: 'Invalid signature', message: error }, { status: 401 })
    }
  }
}
