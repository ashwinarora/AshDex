import { useQuery } from '@tanstack/react-query'

interface Token {
  name: string
  tokenId: string
}

interface Sdk {
  info: {
    spot: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getTokenDetails: (tokenId: string) => Promise<any>
    }
    perpetuals: {
      getMetaAndAssetCtxs: () => Promise<
        [{ universe: { name?: string }[] }, { dayNtlVlm?: number }[]]
      >
    }
  }
}

export const useTokenDetails = (sdk: Sdk | null, safeTokens: Token[], selectedAsset: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchTokenDetails = async (): Promise<any | null> => {
    if (!sdk || !safeTokens?.length || !selectedAsset) return null
    const baseSymbol = selectedAsset?.split('-')[0].toLowerCase()
    const matchedToken = safeTokens?.find((token) => token?.name.toLowerCase() === baseSymbol)
    if (!matchedToken) return null
    try {
      const tokenData = await sdk.info.spot.getTokenDetails(matchedToken?.tokenId)
      const volumeData = await sdk.info.perpetuals.getMetaAndAssetCtxs()
      const universeIndex = volumeData[0]?.universe?.findIndex(
        (token) => token?.name?.toLowerCase() === selectedAsset?.toLowerCase()
      )
      return {
        ...tokenData,
        volume: universeIndex !== -1 ? (volumeData[1]?.[universeIndex]?.dayNtlVlm ?? 0) : 0
      }
    } catch (error) {
      console.error('Error fetching token details:', error)
      return null
    }
  }
  return useQuery({
    queryKey: ['tokenDetails', !!sdk, safeTokens, selectedAsset],
    queryFn: fetchTokenDetails,
    enabled: Boolean(sdk && safeTokens?.length && selectedAsset),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}
