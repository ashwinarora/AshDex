import { useQuery } from '@tanstack/react-query'

interface Token {
  name: string
  tokenId: string
}

interface Sdk {
  info: {
    spot: {
      getSpotMetaAndAssetCtxs: () => Promise<{ tokens: Token[] }[]>
    }
  }
}

export const usePerpetualData = (sdk: Sdk | null, isSdkConnected: boolean) => {
  const fetchPerpetualData = async (sdk: Sdk): Promise<Token[]> => {
    if (!sdk) return []
    try {
      const data = await sdk.info.spot.getSpotMetaAndAssetCtxs()
      return data[0]?.tokens ?? []
    } catch (error) {
      console.error('Error fetching perpetual data:', error)
      return []
    }
  }

  return useQuery({
    queryKey: ['perpetualData', isSdkConnected],
    queryFn: () => fetchPerpetualData(sdk!),
    enabled: Boolean(sdk && isSdkConnected),
    staleTime: 1000 * 60 * 5
  })
}
