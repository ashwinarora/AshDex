import { Address, recoverMessageAddress, Signature } from 'viem'
import * as hl from '@nktkas/hyperliquid'

export async function getAuthMasterAccount(
  payload: string,
  signature: Signature
): Promise<Address> {
  const user: Address = await recoverMessageAddress({
    message: payload,
    signature: signature
  })

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const raw = JSON.stringify({
    type: 'userRole',
    user: user
  })

  const response = await fetch('https://api.hyperliquid-testnet.xyz/info', {
    method: 'POST',
    headers: myHeaders,
    body: raw
  })

  const userRole = (await response.json()) as hl.UserRole

  if (!userRole) {
    throw new Error('Agent Wallet not found on HL')
  } else if (userRole.role !== 'agent') {
    throw new Error('Signed address is not an agent wallet')
  }

  console.log('userRole.data.user', userRole.data.user)

  return userRole.data.user
}
