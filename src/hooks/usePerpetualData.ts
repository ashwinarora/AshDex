import { useHyperliquid } from '@/store/HyperliquidStore'
import { useQuery } from '@tanstack/react-query'

export interface Token {
  name: string
  tokenId: string
  index: number
}

export interface SpotMeta {
  tokens: Token[]
  universe: Array<{
    tokens: number[]
    index: number
  }>
}

export interface SpotAssetCtx {
  coin: string
  price: number
}

interface Sdk {
  info: {
    spot: {
      getSpotMetaAndAssetCtxs: () => Promise<[SpotMeta, SpotAssetCtx[]]>
    }
  }
}

export const usePerpetualData = () => {
  const { sdk } = useHyperliquid()
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
    queryKey: ['perpetualData'],
    queryFn: () => fetchPerpetualData(sdk!),
    enabled: Boolean(sdk),
    staleTime: 1000 * 60 * 5
  })
}
