import { useQuery } from '@tanstack/react-query'
import { useConnection } from 'wagmi'
import axios from 'axios'

interface TermsSignatureResponse {
  signed: boolean
}

export const useTermsSignature = (walletId?: string) => {
  const { address } = useConnection()
  const resolvedWalletId = walletId ?? address

  return useQuery<TermsSignatureResponse>({
    queryKey: ['termsSignature', resolvedWalletId],
    queryFn: async () => {
      const { data } = await axios.get('/api/user-terms', {
        params: { wallet_id: resolvedWalletId }
      })
      return data
    },
    enabled: !!resolvedWalletId
  })
}
