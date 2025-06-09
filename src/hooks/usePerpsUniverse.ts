import { useHyperliquid } from '@/store/HyperliquidStore'
import { MetaData } from '@/utils/hyperliquid/hyperLiquidTypes'
import { useQuery } from '@tanstack/react-query'

export const usePerpsUniverse = () => {
  const { sdk } = useHyperliquid()
  return useQuery<MetaData[]>({
    queryKey: ['universe'],
    queryFn: async () => {
      if (!sdk) return []
      const res = await sdk.info.perpetuals.getMeta()
      return res.universe as MetaData[]
    },
    enabled: !!sdk,
    initialData: []
  })
}
