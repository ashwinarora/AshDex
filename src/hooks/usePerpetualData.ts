import { useHyperliquid } from '@/store/HyperliquidStore'
import { useQuery } from '@tanstack/react-query'
import { Candle } from '@/utils/hyperliquid/hyperLiquidTypes'
import { IWebData2 } from '@/utils/hyperliquid/webData2Types'
import type { Hex } from 'viem'

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
    spot?: {
      getSpotMetaAndAssetCtxs: () => Promise<[SpotMeta, SpotAssetCtx[]]>
    }
    getCandleSnapshot: (
      asset: string,
      interval: string,
      from: number,
      to: number
    ) => Promise<Candle[]>
  }
  subscriptions: {
    subscribeToAllMids: (callback: (data: Record<string, number>) => void) => void
    unsubscribeFromAllMids: () => void
    subscribeToWebData2: (address: Hex, callback: (data: IWebData2) => void) => void
    unsubscribeFromWebData2: (address: Hex) => void
    subscribeToCandle: (
      asset: string,
      interval: string,
      callback: (data: Candle[] | Candle) => void
    ) => void
    unsubscribeFromCandle: (asset: string, interval: string) => void
  }
}

export const usePerpetualData = () => {
  const { sdk } = useHyperliquid()
  const fetchPerpetualData = async (sdk: Sdk): Promise<Token[]> => {
    if (!sdk) return []
    try {
      const data = await sdk.info.spot?.getSpotMetaAndAssetCtxs()
      return data?.[0]?.tokens ?? []
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
