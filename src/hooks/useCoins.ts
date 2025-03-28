import { useQuery } from '@tanstack/react-query'

interface Coin {
  symbol: string
  id: string
}

export const useCoins = () => {
  const fetchCoins = async (): Promise<Coin[]> => {
    const response = await fetch('/api/coins')
    return response.json()
  }
  return useQuery({
    queryKey: ['allCoins'],
    queryFn: fetchCoins,
    staleTime: 1000 * 60 * 5
  })
}
