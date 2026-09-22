'use client'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useOutcomeMeta } from '@/hooks/useOutcomeMeta'
import {
  isOutcomeBalanceCoin,
  parseOutcomeEncoding,
  decodeOutcomeEncoding
} from '@/utils/outcomes/encoding'

/**
 * Toasts when a HIP-4 outcome the user holds shares in settles. Fed by the
 * `outcomeMetaUpdates` WS channel (store.recentOutcomeSettlements). Mounted
 * once in the root layout; renders nothing.
 */
const OutcomeSettlementToaster = () => {
  const { recentOutcomeSettlements, spotState } = useHyperliquidStore(
    useShallow((s) => ({
      recentOutcomeSettlements: s.recentOutcomeSettlements,
      spotState: s.spotState
    }))
  )
  const { resolved } = useOutcomeMeta()
  const seen = useRef<Set<number>>(new Set())

  useEffect(() => {
    const held = new Set<number>()
    for (const b of spotState?.balances ?? []) {
      if (!isOutcomeBalanceCoin(b.coin) || Number(b.total) <= 0) continue
      const enc = parseOutcomeEncoding(b.coin)
      if (enc !== null) held.add(decodeOutcomeEncoding(enc).outcome)
    }
    for (const id of recentOutcomeSettlements) {
      if (seen.current.has(id)) continue
      seen.current.add(id)
      if (!held.has(id)) continue
      const title = resolved.outcomes.get(id)?.title ?? `Outcome #${id}`
      toast.info(`Outcome market settled: ${title}`, {
        description: 'Winning shares were paid out in quote. See Settled Outcomes for details.'
      })
    }
  }, [recentOutcomeSettlements, spotState?.balances, resolved])

  return null
}

export default OutcomeSettlementToaster
