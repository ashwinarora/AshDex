import { NextRequest, NextResponse } from 'next/server'
import { getAuthMasterAccount } from '@/lib/auth'
import type { Address, Signature } from 'viem'
import UserManager from '@/services/User.manager'
import { HttpStatusCode } from 'axios'
import { minutesToMilliseconds } from 'date-fns'

export interface AuthenticatedRequest<TPayload> extends NextRequest {
  wallet_id: Address
  signature: Signature
  payload: TPayload
}

interface RequestBody<TPayload> {
  signature?: Signature
  payload?: TPayload
  timestamp?: number
}

const TIMESTAMP_EXPIRY_MS = minutesToMilliseconds(5)

// Middleware wrapper to authenticate requests
// Validates signature and augments request with wallet_id and payload
export function withAuth<TPayload>(
  handler: (request: AuthenticatedRequest<TPayload>) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const body = (await request.json()) as RequestBody<TPayload>
      const { signature, payload, timestamp } = body

      // Validate required fields
      if (!timestamp) {
        return NextResponse.json(
          { error: 'Missing timestamp in payload' },
          { status: HttpStatusCode.BadRequest }
        )
      }

      if (!payload) {
        return NextResponse.json(
          { error: 'Missing payload' },
          { status: HttpStatusCode.BadRequest }
        )
      }

      if (!signature) {
        return NextResponse.json(
          { error: 'Missing signature' },
          { status: HttpStatusCode.BadRequest }
        )
      }

      // Validate timestamp freshness
      if (timestamp < Date.now() - TIMESTAMP_EXPIRY_MS) {
        return NextResponse.json(
          { error: 'Timestamp is too old' },
          { status: HttpStatusCode.BadRequest }
        )
      }

      // Verify signature and get wallet address
      const masterAccount = await getAuthMasterAccount(JSON.stringify(payload), signature)

      // Verify user exists
      const user = await UserManager.findUserByWalletId(masterAccount)
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: HttpStatusCode.NotFound })
      }

      // Augment request with authentication data
      const authenticatedRequest = request as AuthenticatedRequest<TPayload>
      authenticatedRequest.wallet_id = masterAccount
      authenticatedRequest.payload = payload

      return handler(authenticatedRequest)
    } catch (error) {
      console.error('Error verifying signature:', error)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: HttpStatusCode.Unauthorized }
      )
    }
  }
}
