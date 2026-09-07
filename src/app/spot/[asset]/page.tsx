'use client'

import Trading from '@/components/Trading/Trading'
import { useParams } from 'next/navigation'
import { isWhitelistedSpotRouteAsset } from '@/utils/whitelist'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { IconMoodSadDizzy } from '@tabler/icons-react'
export default function SpotAssetTradingPage() {
  const params = useParams<{ asset: string }>()
  const asset = params?.asset?.toUpperCase() ?? ''
  if (!isWhitelistedSpotRouteAsset(asset)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-4 text-center">
        <IconMoodSadDizzy className="size-24 text-white" />
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-4xl font-bold text-white">{'404 - Asset Not Found'}</h1>
          <p className="text-lg text-white/70 max-w-md text-center">
            {'Looks like'}{' '}
            <span className="text-primary font-semibold">{asset || 'this asset'}</span>{' '}
            {'went on vacation and forgot to tell us where.'}
          </p>
          <p className="text-sm text-white/50 text-center">
            {"It's not you, it's the asset. We just don't have it... yet."}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/spot">
            <Button variant="default">{'Check Out Spot'}</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">{'Check Out Perps'}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return <Trading defaultAsset={asset} />
}
