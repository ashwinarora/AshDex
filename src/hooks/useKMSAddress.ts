import { useQuery } from '@tanstack/react-query'

interface KMSAddressResponse {
  address: string
}

export const useKMSAddress = () => {
  const fetchKMSAddress = async (): Promise<KMSAddressResponse> => {
    const response = await fetch('/api/admin')
    if (!response.ok) {
      throw new Error('Failed to fetch KMS address')
    }
    return response.json()
  }

  return useQuery({
    queryKey: ['kmsAddress'],
    queryFn: fetchKMSAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  })
}
