import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import axios from 'axios'

interface TermsSignatureResponse {
  signed: boolean
}

export const useTermsSignature = () => {
  const { address } = useAccount()

  return useQuery<TermsSignatureResponse>({
    queryKey: ['termsSignature', address],
    queryFn: async () => {
      const { data } = await axios.get('/api/user-terms', {
        params: { wallet_id: address }
      })
      return data
    },
    enabled: !!address
  })
}
