import { useHyperliquid } from '@/store/HyperliquidStore'
import { SpotMeta } from '@nktkas/hyperliquid'
import { useQuery } from '@tanstack/react-query'

export const useSpotMeta = () => {
  const { sdkInfoClient } = useHyperliquid()

  return useQuery<SpotMeta | undefined>({
    queryKey: ['spotMeta'],
    queryFn: async () => {
      if (!sdkInfoClient) return
      const res = await sdkInfoClient.spotMeta()
      return res
    },
    enabled: !!sdkInfoClient
  })
}
