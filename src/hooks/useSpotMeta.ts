import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { SpotMeta } from '@nktkas/hyperliquid'
import { useQuery } from '@tanstack/react-query'

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

  // Store computed Maps in TanStack Query cache to avoid duplication
  const spotKeyToNameQuery = useQuery<Map<string, string>>({
    queryKey: ['spotKeyToName'],
    queryFn: () => {
      if (!query.data) return new Map()
      return new Map(
        query.data.universe.map((universe) => [
          universe.name,
          query.data?.tokens[universe.tokens[0]]?.name
        ])
      )
    },
    enabled: !!query.data,
    staleTime: Infinity, // These computed values don't change unless spotMeta changes
    gcTime: Infinity, // Keep in cache indefinitely since they're derived from spotMeta
  })

  const spotKeyToBaseNameQuery = useQuery<Map<string, string>>({
    queryKey: ['spotKeyToBaseName'],
    queryFn: () => {
      if (!query.data) return new Map()
      return new Map(
        query.data.universe.map((universe) => [
          universe.name,
          query.data?.tokens[universe.tokens[1]]?.name
        ])
      )
    },
    enabled: !!query.data,
    staleTime: Infinity, // These computed values don't change unless spotMeta changes
    gcTime: Infinity, // Keep in cache indefinitely since they're derived from spotMeta
  })

  return { 
    ...query, 
    spotKeyToName: spotKeyToNameQuery.data || new Map(), 
    spotKeyToBaseName: spotKeyToBaseNameQuery.data || new Map() 
  }
}
