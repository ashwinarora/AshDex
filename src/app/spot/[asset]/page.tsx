'use client'

import Trading from '@/components/Trading/Trading'
import { useParams } from 'next/navigation'

const SpotAssetTradingPage = () => {
  const { asset } = useParams()
  return <Trading defaultAsset={asset as string} />
}

export default SpotAssetTradingPage
