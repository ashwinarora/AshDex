import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { useQuery } from '@tanstack/react-query'
import { useSpotMeta } from './useSpotMeta'

export const useTokenDetails = (selectedAsset: string) => {
  const { sdkInfoClient } = useHyperliquidStore(
    useShallow((state) => ({
      sdkInfoClient: state.sdkInfoClient
    }))
  )
  const { data: spotMeta } = useSpotMeta()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchTokenDetails = async (): Promise<any | null> => {
    if (!sdkInfoClient || !selectedAsset) return null

    try {
      const baseSymbol = selectedAsset?.split('-')[0].toLowerCase()
      const matchedToken = spotMeta?.tokens.length
        ? spotMeta.tokens.find((token) => token?.name.toLowerCase() === baseSymbol)
        : null

      const [tokenData, volumeData] = await Promise.all([
        matchedToken
          ? sdkInfoClient.tokenDetails({
              tokenId: matchedToken.tokenId
            })
          : Promise.resolve({}),
        sdkInfoClient.metaAndAssetCtxs()
      ])

      const universeIndex = volumeData[0]?.universe?.findIndex(
        (token) => token?.name?.toLowerCase() === selectedAsset?.toLowerCase()
      )

      return {
        ...tokenData,
        volume: universeIndex !== -1 ? (volumeData[1]?.[universeIndex]?.dayNtlVlm ?? 0) : 0,
        funding: universeIndex !== -1 ? (volumeData[1]?.[universeIndex]?.funding ?? 0) : 0
      }
    } catch (error) {
      console.error('Error fetching token details:', error)
      return null
    }
  }

  return useQuery({
    queryKey: ['tokenDetails', selectedAsset],
    queryFn: fetchTokenDetails,
    enabled: Boolean(sdkInfoClient && selectedAsset),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}
