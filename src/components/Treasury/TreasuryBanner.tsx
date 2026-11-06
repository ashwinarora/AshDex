'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useTradingAccount } from '@/hooks/useTradingAccount'
import { cn } from '@/lib/utils'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { truncateAddress } from '@/utils/utils'
import { treasuryBannerView } from '@/utils/treasury/banner'
import { treasuryPageHref } from '@/utils/treasury/route'

/** Persistent strip under the header while trading for a treasury. */
const TreasuryBanner = () => {
  const { mode, treasury } = useTradingAccount()
  const { treasuryStatus } = useAgentApproval()
  const sdkInfoClient = useHyperliquidStore((s) => s.sdkInfoClient)

  const signers = useQuery({
    queryKey: ['multiSigSigners', treasury?.address],
    queryFn: () => sdkInfoClient!.userToMultiSigSigners({ user: treasury!.address }),
    enabled: mode === 'treasury' && !!treasury && !!sdkInfoClient,
    staleTime: 5 * 60_000
  })

  if (mode !== 'treasury' || !treasury || !treasuryStatus) return null

  const view = treasuryBannerView({
    status: treasuryStatus,
    treasuryLabel: truncateAddress(treasury.address),
    signers: signers.data
      ? { threshold: signers.data.threshold, total: signers.data.authorizedUsers.length }
      : null,
    now: Date.now()
  })

  return (
    // Sticks under the (sticky, h-12) header; opaque base so content can't show through.
    <div className="sticky top-12 z-30 w-full bg-secondary">
      <div
        role="status"
        data-testid="treasury-banner"
        data-tone={view.tone}
        className={cn(
          'w-full px-4 py-1.5 text-xs flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center',
          view.tone === 'normal' && 'bg-primary/15 text-white',
          view.tone === 'warn' && 'bg-amber-500/25 text-amber-100',
          view.tone === 'danger' && 'bg-red/30 text-white'
        )}
      >
        <span>{view.text}</span>
        {view.action && (
          <Link
            href={treasuryPageHref(treasury.network, treasury.address)}
            className="underline font-medium"
            data-testid="treasury-banner-action"
          >
            {view.action}
          </Link>
        )}
      </div>
    </div>
  )
}

export default TreasuryBanner
