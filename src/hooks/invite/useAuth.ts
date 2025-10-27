import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useAccount } from 'wagmi'

// A hook that adds timestamp and signature of the payload using agent wallet
// returns request body to be sent to the server
export const useAuth = <T>() => {
  const { address } = useAccount()
  const { agentWallet } = useHyperliquidStore()

  return async ({ payload }: { payload: T }) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    if (!agentWallet) {
      throw new Error('Agent wallet not connected')
    }

    const timestamp = Date.now()
    const signature = await agentWallet.signMessage({
      message: JSON.stringify(payload)
    })
    return {
      signature,
      payload,
      timestamp
    }
  }
}
