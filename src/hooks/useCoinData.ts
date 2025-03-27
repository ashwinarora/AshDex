import { useQuery } from '@tanstack/react-query'

interface Coin {
  symbol: string
  id: string
}

export const useCoinData = (allCoins: Coin[], selectedAsset: string) => {
  const fetchCoinData = async () => {
    if (!allCoins.length || !selectedAsset) return { coinData: null, coinInfo: null }

    const baseSymbol = selectedAsset?.split('-')[0].toLowerCase()
    const selectedCoin = allCoins?.find((coin) => coin?.symbol.toLowerCase() === baseSymbol)

    if (!selectedCoin?.id) {
      console.error('Selected coin not found or ID is undefined')
      return { coinData: null, coinInfo: null }
    }

    try {
      const response = await fetch(`/api/coin/${selectedCoin.id}`)
      if (!response.ok) throw new Error('Failed to fetch coin data')
      const data = await response.json()

      return {
        coinData: data?.marketPairs?.[selectedCoin?.id] ?? null,
        coinInfo: data?.coinInfo?.[selectedCoin?.id] ?? null
      }
    } catch (error) {
      console.error('Error fetching coin data:', error)
      return { coinData: null, coinInfo: null }
    }
  }

  return useQuery({
    queryKey: ['coinData', allCoins, selectedAsset],
    queryFn: fetchCoinData,
    enabled: Boolean(allCoins.length && selectedAsset),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}
