import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { Address, recoverMessageAddress, Signature } from 'viem'

export async function getAuthMasterAccount(
  payload: string,
  signature: Signature
): Promise<Address> {
  const user: Address = await recoverMessageAddress({
    message: payload,
    signature: signature
  })

  const { sdkInfoClient } = useHyperliquidStore.getState()

  const userRole = await sdkInfoClient?.userRole({ user })
  if (!userRole) {
    throw new Error('Agent Wallet not found on HL')
  } else if (userRole.role !== 'agent') {
    throw new Error('Signed address is not an agent wallet')
  }

  return userRole.data.user
}
