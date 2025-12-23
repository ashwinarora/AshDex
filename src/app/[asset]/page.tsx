'use client'

import Trading from '@/components/Trading/Trading'
import { useParams } from 'next/navigation'

export default function AssetTradingPage() {
  const params = useParams<{ asset: string }>()
  const asset = params?.asset

  // `useParams()` can be null per Next.js typings; keep `Trading` happy with a string.
  return <Trading defaultAsset={asset ?? ''} />
}
