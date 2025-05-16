import { useHyperliquid } from '@/store/HyperliquidStore'
import { useQuery } from '@tanstack/react-query'
import { SpotMeta } from '@/utils/hyperliquid/hyperLiquidTypes'

export const useSpotMeta = () => {
  const { sdk } = useHyperliquid()

  return useQuery<SpotMeta>({
    queryKey: ['spotUniverse'],
    queryFn: async () => {
      if (!sdk) return { tokens: [], universe: [] }
      const res = await sdk.info.spot.getSpotMeta()
      return res as SpotMeta
    },
    enabled: !!sdk,
    initialData: {
      tokens: [],
      universe: []
    }
  })
}
