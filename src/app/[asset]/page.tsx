'use client'

import Trading from '@/components/Trading/Trading'
import { useParams } from 'next/navigation'

export default function AssetTradingPage() {
  const { asset } = useParams()
  return <Trading defaultAsset={asset as string} />
}
