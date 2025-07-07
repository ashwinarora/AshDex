import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { SpotMeta } from '@nktkas/hyperliquid'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

export const useSpotMeta = () => {
  const { sdkInfoClient } = useHyperliquidStore(
    useShallow((state) => ({
      sdkInfoClient: state.sdkInfoClient
    }))
  )

  const query = useQuery<SpotMeta | undefined>({
    queryKey: ['spotMeta'],
    queryFn: async () => {
      if (!sdkInfoClient) return
      const res = await sdkInfoClient.spotMeta()
      return res
    },
    enabled: !!sdkInfoClient
  })

  const spotKeyToName: Map<string, string> = useMemo(() => {
    if (!query.data) return new Map()
    return new Map(
      query.data.universe.map((universe) => [
        universe.name,
        query.data?.tokens[universe.tokens[0]]?.name
      ])
    )
  }, [query.data])

  return { ...query, spotKeyToName }
}
