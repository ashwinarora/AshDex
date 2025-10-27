'use client'

import Trading from '@/components/Trading/Trading'
import { useParams, useRouter } from 'next/navigation'
import { DEFAULT_SPOT_ASSET, isWhitelistedSpotRouteAsset } from '@/utils/whitelist'
import { useEffect } from 'react'

export default function SpotAssetTradingPage() {
  const { asset } = useParams()
  const router = useRouter()

  useEffect(() => {
    if (!isWhitelistedSpotRouteAsset(asset as string)) {
      router.replace(`/spot/${DEFAULT_SPOT_ASSET}`)
    }
  }, [asset, router])

  return <Trading defaultAsset={asset as string} />
}
