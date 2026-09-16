'use client'

import Trading from '@/components/Trading/Trading'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAssetTabTitle } from '@/hooks/useAssetTabTitle'

/**
 * Perps trading route.
 *
 * R2-B10 fix: previously, an unknown asset like `/NOTACOIN` rendered a
 * broken shell — `Max = Infinity`, `Margin Required = $NaN`, no order book.
 * We now wait for `perpsMeta` to hydrate; if the URL asset is not present
 * in the universe, redirect to `/BTC`. Meta is still hydrating? Render the
 * default asset while we wait — no broken shell in the meantime.
 */
export default function AssetTradingPage() {
  const params = useParams<{ asset: string }>()
  const router = useRouter()
  const asset = params?.asset?.toUpperCase() ?? ''
  const perpsMeta = useHyperliquidStore((s) => s.perpsMeta)

  useEffect(() => {
    if (!perpsMeta) return // meta not loaded yet — don't redirect prematurely
    const exists = perpsMeta.universe.some((a) => a.name === asset)
    if (!exists) router.replace('/BTC')
  }, [asset, perpsMeta, router])

  useAssetTabTitle({ asset, isSpot: false })

  return <Trading defaultAsset={asset} />
}
