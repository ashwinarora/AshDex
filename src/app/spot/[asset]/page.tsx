'use client'

import Trading from '@/components/Trading/Trading'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAssetTabTitle } from '@/hooks/useAssetTabTitle'

/**
 * Spot trading route.
 *
 * R2-B10 (spot mirror): same broken-shell issue as the perps route for
 * unknown assets. Wait for spotMeta to hydrate, then redirect to `/spot`
 * (which resolves to the default asset) if the URL asset isn't present.
 */
export default function SpotAssetTradingPage() {
  const params = useParams<{ asset: string }>()
  const router = useRouter()
  const asset = params?.asset?.toUpperCase() ?? ''
  const { data: spotMeta, spotKeyToName } = useSpotMeta()

  useEffect(() => {
    if (!spotMeta) return
    // `spotKeyToName` is a derived React Query that populates one tick after
    // `spotMeta`. If we run the check before it's ready, human-name URLs like
    // `/spot/PURR` fail the lookup (only universe names like "PURR/USDC" are
    // in the set) and get redirected to `/spot`.
    if (spotKeyToName.size === 0) return
    // Spot universe entries look like { name: '@1035', tokens: [...] } and
    // the human name comes from `spotKeyToName`. Accept either form.
    const nameSet = new Set<string>()
    for (const u of spotMeta.universe) {
      nameSet.add(u.name.toUpperCase())
      const humanName = spotKeyToName.get(u.name)
      if (humanName) nameSet.add(humanName.toUpperCase())
    }
    if (!nameSet.has(asset)) router.replace('/spot')
  }, [asset, spotMeta, spotKeyToName, router])

  useAssetTabTitle({ asset, isSpot: true })

  return <Trading defaultAsset={asset} />
}
