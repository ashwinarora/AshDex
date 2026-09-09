'use client'

import Trading from '@/components/Trading/Trading'
import { useParams } from 'next/navigation'

// No route-level asset guard: whatever Hyperliquid exposes is fair game.
// If the URL asset doesn't exist, the spot trading page falls back to its
// default asset — matches the "display everything Hyperliquid gives us"
// contract.
export default function SpotAssetTradingPage() {
  const params = useParams<{ asset: string }>()
  const asset = params?.asset?.toUpperCase() ?? ''
  return <Trading defaultAsset={asset} />
}
