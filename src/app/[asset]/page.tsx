'use client'

import Trading from '@/components/Trading/Trading'
import { useParams } from 'next/navigation'

// No route-level asset guard: whatever Hyperliquid exposes is fair game.
// If the URL asset doesn't exist in the loaded universe, the trading page
// renders its default (BTC) — matches the "display everything Hyperliquid
// gives us" contract.
export default function AssetTradingPage() {
  const params = useParams<{ asset: string }>()
  const asset = params?.asset?.toUpperCase() ?? ''
  return <Trading defaultAsset={asset} />
}
