import { isOutcomeBalanceCoin, isSettledOutcomeBalanceCoin, parseOutcomeEncoding } from './encoding'
import { midFor, type OutcomeCtx } from './cards'
import type { ResolvedOutcomeMeta } from './template'
import type { ResolvedOutcome, ResolvedSide } from './types'

export type OutcomeBalanceRow = { coin: string; total: string; hold: string; entryNtl?: string }

export type OutcomePosition = {
  encoding: number
  coin: string
  balanceCoin: string
  outcome: ResolvedOutcome
  side: ResolvedSide
  /** Shares held. */
  size: number
  /** Shares locked in resting sell orders. */
  hold: number
  /** Cost basis in quote. */
  entryNtl: number
  /** entryNtl / size. */
  avgPx: number | null
  markPx: number | null
  /** size × mark. */
  value: number | null
  pnl: number | null
  pnlPct: number | null
  /** What the position pays if this side settles to 1. */
  payoutIfWins: number
  /** Cost basis — the most that can be lost (fully collateralised). */
  maxLoss: number
}

/** Balances the meta no longer knows about (settled and swept) or explicit `o…` remnants. */
export type SettledRemnant = { coin: string; total: number; encoding: number | null }

const num = (v: string | number | null | undefined, d = 0): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}

export const deriveOutcomePositions = (
  balances: OutcomeBalanceRow[] | undefined,
  resolved: ResolvedOutcomeMeta,
  mids: Record<string, string>,
  ctxs: OutcomeCtx[]
): { positions: OutcomePosition[]; remnants: SettledRemnant[] } => {
  const positions: OutcomePosition[] = []
  const remnants: SettledRemnant[] = []
  const ctxByCoin = new Map(ctxs.filter((c) => c.coin.startsWith('#')).map((c) => [c.coin, c]))
  for (const b of balances ?? []) {
    const total = num(b.total)
    if (total <= 0) continue
    if (isSettledOutcomeBalanceCoin(b.coin)) {
      remnants.push({ coin: b.coin, total, encoding: null })
      continue
    }
    if (!isOutcomeBalanceCoin(b.coin)) continue
    const enc = parseOutcomeEncoding(b.coin)
    if (enc === null) continue
    const hit = resolved.byEncoding.get(enc)
    if (!hit) {
      remnants.push({ coin: b.coin, total, encoding: enc })
      continue
    }
    const markPx = midFor(hit.side.coin, mids, ctxByCoin)
    const entryNtl = num(b.entryNtl)
    const value = markPx === null ? null : total * markPx
    const pnl = value === null ? null : value - entryNtl
    positions.push({
      encoding: enc,
      coin: hit.side.coin,
      balanceCoin: b.coin,
      outcome: hit.outcome,
      side: hit.side,
      size: total,
      hold: num(b.hold),
      entryNtl,
      avgPx: total > 0 && entryNtl > 0 ? entryNtl / total : null,
      markPx,
      value,
      pnl,
      pnlPct: pnl !== null && entryNtl > 0 ? (pnl / entryNtl) * 100 : null,
      payoutIfWins: total,
      maxLoss: entryNtl
    })
  }
  positions.sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
  return { positions, remnants }
}

/** Quote-token balance available for new buys. */
export const quoteAvailable = (
  balances: OutcomeBalanceRow[] | undefined,
  quoteToken = 'USDC'
): number => {
  const row = balances?.find((b) => b.coin === quoteToken)
  if (!row) return 0
  return Math.max(0, num(row.total) - num(row.hold))
}

/** Shares of one side available to sell (total − hold). */
export const sideAvailable = (
  balances: OutcomeBalanceRow[] | undefined,
  balanceCoin: string
): number => {
  const row = balances?.find((b) => b.coin === balanceCoin)
  if (!row) return 0
  return Math.max(0, num(row.total) - num(row.hold))
}
