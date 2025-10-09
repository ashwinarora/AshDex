import { Address, recoverMessageAddress, Signature } from 'viem'
import HLService from '@/services/hl.service'

export async function getAuthMasterAccount(
  payload: string,
  signature: Signature
): Promise<Address> {
  const user: Address = await recoverMessageAddress({
    message: payload,
    signature: signature
  })

  const userRole = await HLService.getUserRole(user)

  if (!userRole) {
    throw new Error('Agent Wallet not found on HL')
  } else if (userRole.role !== 'agent') {
    throw new Error('Signed address is not an agent wallet')
  }

  console.log('userRole.data.user', userRole.data.user)

  return userRole.data.user
}
