import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useOutcomeMeta } from '@/hooks/useOutcomeMeta'
import { buildOutcomeCards, indexCtxs, midFor, type OutcomeCard } from '@/utils/outcomes/cards'
import { deriveOutcomePositions } from '@/utils/outcomes/positions'
import { labelForEncoding } from '@/utils/outcomes/template'
import { parseOutcomeEncoding } from '@/utils/outcomes/encoding'

/** Live catalog + prices joined into grid cards. */
export const useOutcomeCards = (): { cards: OutcomeCard[]; isReady: boolean } => {
  const { resolved, isReady } = useOutcomeMeta()
  const { allMids, spotAssetContext } = useHyperliquidStore(
    useShallow((s) => ({ allMids: s.allMids, spotAssetContext: s.spotAssetContext }))
  )
  const cards = useMemo(
    () => buildOutcomeCards(resolved, allMids, spotAssetContext),
    [resolved, allMids, spotAssetContext]
  )
  return { cards, isReady }
}

/** Live price / 24h stats for one `#enc` coin. */
export const useOutcomeSideStats = (coin: string | undefined) => {
  const { allMids, spotAssetContext } = useHyperliquidStore(
    useShallow((s) => ({ allMids: s.allMids, spotAssetContext: s.spotAssetContext }))
  )
  return useMemo(() => {
    if (!coin) return { mid: null, markPx: null, prevDayPx: null, dayNtlVlm: 0, change24hPct: null }
    const ctxByCoin = indexCtxs(spotAssetContext)
    const ctx = ctxByCoin.get(coin)
    const mid = midFor(coin, allMids, ctxByCoin)
    const prevDayPx = ctx?.prevDayPx ? Number(ctx.prevDayPx) : null
    const change24hPct =
      mid !== null && prevDayPx !== null && prevDayPx > 0
        ? ((mid - prevDayPx) / prevDayPx) * 100
        : null
    return {
      mid,
      markPx: ctx?.markPx ? Number(ctx.markPx) : mid,
      prevDayPx,
      dayNtlVlm: ctx?.dayNtlVlm ? Number(ctx.dayNtlVlm) : 0,
      change24hPct
    }
  }, [coin, allMids, spotAssetContext])
}

/** Outcome share positions derived from the user's spot balances. */
export const useOutcomePositions = () => {
  const { resolved, isReady } = useOutcomeMeta()
  const { allMids, spotAssetContext, spotState } = useHyperliquidStore(
    useShallow((s) => ({
      allMids: s.allMids,
      spotAssetContext: s.spotAssetContext,
      spotState: s.spotState
    }))
  )
  return useMemo(
    () => ({
      ...deriveOutcomePositions(spotState?.balances, resolved, allMids, spotAssetContext),
      isReady
    }),
    [spotState?.balances, resolved, allMids, spotAssetContext, isReady]
  )
}

/** Resolve `#enc` / `+enc` coins to human labels for tables. */
export const useOutcomeCoinLabel = () => {
  const { resolved } = useOutcomeMeta()
  return useMemo(
    () =>
      (coin: string, style: 'full' | 'short' = 'short'): string => {
        const enc = parseOutcomeEncoding(coin)
        if (enc === null) return coin
        return labelForEncoding(resolved, enc, style) ?? coin
      },
    [resolved]
  )
}

/* ---------------------------------------------------------------------------
 * Settled-market history
 * ------------------------------------------------------------------------- */

import { useQueries, useQuery } from '@tanstack/react-query'
import type { Hex } from 'viem'
import type { UserFillsResponse } from '@nktkas/hyperliquid/api/info'
import { decodeOutcomeEncoding, isOutcomeCoin } from '@/utils/outcomes/encoding'
import { resolveOutcomeMeta } from '@/utils/outcomes/template'
import type { RawOutcome, RawQuestion } from '@/utils/outcomes/types'

export type SettledOutcomeRow = {
  outcomeId: number
  title: string
  outcomeLabel?: string
  sideNames: [string, string]
  /** 1 = first side paid $1; 0 = second side paid $1; 0.5 = void/tie. */
  settleFraction: number
  details: string
  venue: string | null
  /** Shares of each side that were settled (from `dir: "Settlement"` fills). */
  settledShares: [number, number]
  /** Quote credited at settlement: Σ px × sz over settlement fills. */
  payout: number
  /** Σ closedPnl over every fill on this outcome (trades, merges, settlement). */
  realizedPnl: number
  /** Σ fees over every fill on this outcome (settlement charges a taker fee). */
  fees: number
  settledAt: number
}

export const useSettledOutcomes = (address: Hex | undefined) => {
  const { resolved, templates, isReady } = useOutcomeMeta()
  const sdkInfoClient = useHyperliquidStore((s) => s.sdkInfoClient)

  const fills = useQuery<UserFillsResponse>({
    queryKey: ['tradeHistory', address],
    queryFn: async () => {
      if (!address || !sdkInfoClient) return []
      return sdkInfoClient.userFills({ user: address, aggregateByTime: true })
    },
    enabled: !!address && !!sdkInfoClient,
    initialData: []
  })

  const touched = useMemo(() => {
    type Agg = {
      settled: [number, number]
      payout: number
      realizedPnl: number
      fees: number
      settledAt: number
    }
    const byOutcome = new Map<number, Agg>()
    for (const f of fills.data ?? []) {
      if (!isOutcomeCoin(f.coin)) continue
      const enc = parseOutcomeEncoding(f.coin)
      if (enc === null) continue
      const { outcome, side } = decodeOutcomeEncoding(enc)
      if (resolved.outcomes.has(outcome)) continue // still live
      const entry = byOutcome.get(outcome) ?? {
        settled: [0, 0],
        payout: 0,
        realizedPnl: 0,
        fees: 0,
        settledAt: 0
      }
      const sz = Number(f.sz)
      if (f.dir === 'Settlement') {
        entry.settled[side] += sz
        entry.payout += sz * Number(f.px)
        entry.settledAt = Math.max(entry.settledAt, f.time)
      }
      entry.realizedPnl += Number(f.closedPnl) || 0
      entry.fees += Number(f.fee) || 0
      byOutcome.set(outcome, entry)
    }
    return byOutcome
  }, [fills.data, resolved])

  const ids = useMemo(() => [...touched.keys()].sort((a, b) => b - a), [touched])

  const settledQueries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['settledOutcome', id],
      queryFn: () => sdkInfoClient!.settledOutcome({ outcome: id }),
      enabled: !!sdkInfoClient && isReady,
      staleTime: Infinity,
      gcTime: 24 * 60 * 60_000
    }))
  })

  const rows: SettledOutcomeRow[] = useMemo(() => {
    const out: SettledOutcomeRow[] = []
    settledQueries.forEach((q, i) => {
      const data = q.data
      const id = ids[i]
      const t = touched.get(id)
      if (!data || !t) return
      const spec = data.spec as RawOutcome
      const questionMeta = data.question
      const qid =
        questionMeta && 'active' in questionMeta.question
          ? questionMeta.question.active
          : questionMeta && 'settled' in questionMeta.question
            ? questionMeta.question.settled
            : undefined
      const synthetic = resolveOutcomeMeta(
        {
          outcomes: [spec],
          questions:
            questionMeta && qid !== undefined
              ? [
                  {
                    question: qid,
                    name: questionMeta.name,
                    description: questionMeta.description,
                    fallbackOutcome: -1,
                    namedOutcomes: [spec.outcome],
                    settledNamedOutcomes: []
                  } satisfies RawQuestion
                ]
              : []
        },
        templates
      )
      const ro = synthetic.outcomes.get(spec.outcome)
      const f = Number(data.settleFraction)
      out.push({
        outcomeId: id,
        title: ro?.title ?? spec.name,
        outcomeLabel: ro?.outcomeLabel,
        sideNames: ro
          ? [ro.sides[0].name, ro.sides[1].name]
          : [spec.sideSpecs[0]?.name ?? 'Yes', spec.sideSpecs[1]?.name ?? 'No'],
        settleFraction: f,
        details: data.details,
        venue: ro?.venue ?? null,
        settledShares: t.settled,
        payout: t.payout,
        realizedPnl: t.realizedPnl,
        fees: t.fees,
        settledAt: t.settledAt
      })
    })
    return out
  }, [settledQueries, ids, touched, templates])

  return {
    rows,
    isLoading: fills.isLoading || settledQueries.some((q) => q.isLoading),
    pendingIds: ids.filter((_, i) => settledQueries[i]?.data === null)
  }
}
