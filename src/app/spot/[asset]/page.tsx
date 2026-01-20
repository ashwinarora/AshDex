'use client'

import Trading from '@/components/Trading/Trading'
import { useParams } from 'next/navigation'
import { isWhitelistedSpotRouteAsset } from '@/utils/whitelist'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { IconMoodSadDizzy } from '@tabler/icons-react'
import { useTranslate } from '@tolgee/react'

export default function SpotAssetTradingPage() {
  const params = useParams<{ asset: string }>()
  const asset = params?.asset?.toUpperCase() ?? ''
  const { t } = useTranslate()

  if (!isWhitelistedSpotRouteAsset(asset)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-4 text-center">
        <IconMoodSadDizzy className="size-24 text-white" />
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-4xl font-bold text-white">{t('404 - Asset Not Found')}</h1>
          <p className="text-lg text-white/70 max-w-md">
            {t('Looks like')}{' '}
            <span className="text-primary font-semibold">{asset || 'this asset'}</span>{' '}
            {t('went on vacation and forgot to tell us where.')}
          </p>
          <p className="text-sm text-white/50">
            {t("It's not you, it's the asset. We just don't have it... yet.")}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/spot">
            <Button variant="default">{t('Trade HYPE Instead')}</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">{t('Check Out Perps')}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return <Trading defaultAsset={asset} />
}
