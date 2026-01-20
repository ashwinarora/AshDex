'use client'

import Trading from '@/components/Trading/Trading'
import { useParams } from 'next/navigation'
import { isWhitelistedPerpRouteAsset } from '@/utils/whitelist'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { IconMoodSadDizzy } from '@tabler/icons-react'
import { useTranslate } from '@tolgee/react'

export default function AssetTradingPage() {
  const params = useParams<{ asset: string }>()
  const asset = params?.asset?.toUpperCase() ?? ''
  const { t } = useTranslate()

  if (!isWhitelistedPerpRouteAsset(asset)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-4 text-center">
        <IconMoodSadDizzy className="size-24 text-white" />
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-4xl font-bold text-white">{t('404 - Asset Not Found')}</h1>
          <p className="text-lg text-white/70 max-w-md text-center">
            {t('Looks like')}{' '}
            <span className="text-primary font-semibold">{asset || 'this asset'}</span>{' '}
            {t('took a wrong turn and ended up in the shadow realm.')}
          </p>
          <p className="text-sm text-white/50 text-center">
            {t(
              "Maybe it's hiding, maybe it doesn't exist. Either way, we can't find it."
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/">
            <Button variant="default">{t('Trade BTC Instead')}</Button>
          </Link>
          <Link href="/spot">
            <Button variant="outline">{t('Check Out Spot')}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return <Trading defaultAsset={asset} />
}
