'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useOutcomeMeta } from '@/hooks/useOutcomeMeta'
import { useOutcomeSideStats } from '@/hooks/useOutcomeMarket'
import OutcomeTrading from '@/components/Outcomes/OutcomeTrading'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_PAGE_TITLE } from '@/config/appMeta'

const parseSide = (raw: string | undefined): 0 | 1 => {
  const v = (raw ?? '').toLowerCase()
  return v === '1' || v === 'no' ? 1 : 0
}

/**
 * Outcome trade route: `/outcomes/<outcomeId>/<yes|no>`. Numeric ids are used
 * instead of slugs because venue-deployed markets can share a human title.
 * Unknown ids redirect to the grid once the catalog has hydrated.
 */
export default function OutcomeTradePage() {
  const params = useParams<{ outcomeId: string; side: string }>()
  const router = useRouter()
  const outcomeId = Number(params?.outcomeId)
  const side = parseSide(params?.side)
  const { resolved, isReady, error } = useOutcomeMeta()
  const outcome = Number.isInteger(outcomeId) ? resolved.outcomes.get(outcomeId) : undefined
  const stats = useOutcomeSideStats(outcome?.sides[side].coin)

  useEffect(() => {
    if (!isReady) return
    if (!outcome) router.replace('/outcomes')
  }, [isReady, outcome, router])

  useEffect(() => {
    if (!outcome) {
      document.title = DEFAULT_PAGE_TITLE
      return
    }
    const px = stats.mid === null ? '' : `${stats.mid.toFixed(5)} | `
    document.title = `${px}${outcome.outcomeLabel ? `${outcome.outcomeLabel} · ` : ''}${outcome.title} | AshDex`
    return () => {
      document.title = DEFAULT_PAGE_TITLE
    }
  }, [outcome, stats.mid])

  if (error) {
    return <p className="p-6 text-sm text-red">Could not load outcome markets.</p>
  }
  if (!outcome) {
    return (
      <div className="p-2 flex flex-col gap-2" data-testid="outcome-trade-loading">
        <Skeleton className="h-16 bg-surface-1" />
        <Skeleton className="h-[600px] bg-surface-1" />
      </div>
    )
  }
  return (
    <OutcomeTrading
      key={`${outcome.outcomeId}-${side}`}
      outcome={outcome}
      side={side}
      resolved={resolved}
    />
  )
}
