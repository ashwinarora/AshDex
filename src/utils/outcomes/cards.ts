import type { OutcomeCategory, ResolvedOutcome, ResolvedSide } from './types'
import type { ResolvedOutcomeMeta } from './template'

/** Minimal shape of a spot/outcome asset ctx we read from `spotAssetCtxs`. */
export type OutcomeCtx = {
  coin: string
  markPx?: string
  midPx?: string | null
  prevDayPx?: string
  dayNtlVlm?: string
}

export type CardSideRow = {
  /** Text shown on the row: side name for standalone, outcome label for question children. */
  label: string
  /** The `#enc` coin this row trades (Yes side for question children). */
  coin: string
  encoding: number
  outcomeId: number
  side: 0 | 1
  /** Mid price in [0,1], or null when the book is empty. */
  price: number | null
  /** Implied probability 0–100 (mid×100). */
  chance: number | null
  /** Payout multiple (1/price) for $1 winners. */
  multiple: number | null
  dayNtlVlm: number
  /** Only for question children: this named outcome already settled to No. */
  settled: boolean
}

export type OutcomeCard = {
  /** `q:<questionId>` or `o:<outcomeId>` — stable React key. */
  key: string
  kind: 'question' | 'outcome'
  questionId?: number
  outcomeId?: number
  title: string
  category: OutcomeCategory
  venue: string | null
  underlying?: string
  expiresAt?: number
  rows: CardSideRow[]
  /** Sum of `dayNtlVlm` across all sides. */
  dayNtlVlm: number
  /** Number of named outcomes for questions (shown as "Outcomes (n)"). */
  outcomeCount?: number
}

const num = (v: string | number | null | undefined): number | null => {
  if (v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** Mid from allMids first (fresher), else ctx midPx/markPx. */
export const midFor = (
  coin: string,
  mids: Record<string, string>,
  ctxByCoin: Map<string, OutcomeCtx>
): number | null => {
  const fromMids = num(mids[coin])
  if (fromMids !== null && fromMids > 0) return fromMids
  const ctx = ctxByCoin.get(coin)
  const mid = num(ctx?.midPx)
  if (mid !== null && mid > 0) return mid
  const mark = num(ctx?.markPx)
  return mark !== null && mark > 0 ? mark : null
}

export const indexCtxs = (ctxs: OutcomeCtx[]): Map<string, OutcomeCtx> =>
  new Map(ctxs.filter((c) => c.coin.startsWith('#')).map((c) => [c.coin, c]))

const rowFor = (
  outcome: ResolvedOutcome,
  side: ResolvedSide,
  label: string,
  mids: Record<string, string>,
  ctxByCoin: Map<string, OutcomeCtx>,
  settled = false
): CardSideRow => {
  const price = midFor(side.coin, mids, ctxByCoin)
  const ctx = ctxByCoin.get(side.coin)
  return {
    label,
    coin: side.coin,
    encoding: side.encoding,
    outcomeId: outcome.outcomeId,
    side: side.side,
    price,
    chance: price === null ? null : price * 100,
    multiple: price === null || price <= 0 ? null : 1 / price,
    dayNtlVlm: num(ctx?.dayNtlVlm) ?? 0,
    settled
  }
}

/**
 * One card per categorical question (rows = named outcomes' Yes sides) and one per standalone
 * outcome (rows = both sides). Fallback outcomes never get a card.
 */
export const buildOutcomeCards = (
  resolved: ResolvedOutcomeMeta,
  mids: Record<string, string>,
  ctxs: OutcomeCtx[]
): OutcomeCard[] => {
  const ctxByCoin = indexCtxs(ctxs)
  const cards: OutcomeCard[] = []

  for (const q of resolved.questions.values()) {
    const rows: CardSideRow[] = []
    let vol = 0
    for (const id of q.outcomeIds) {
      const o = resolved.outcomes.get(id)
      if (!o) continue
      const yes = o.sides[0]
      const settled = q.settledOutcomeIds.includes(id)
      const row = rowFor(o, yes, o.outcomeLabel ?? o.title, mids, ctxByCoin, settled)
      // Volume counts both sides of each named outcome.
      vol += row.dayNtlVlm + (num(ctxByCoin.get(o.sides[1].coin)?.dayNtlVlm) ?? 0)
      rows.push(row)
    }
    if (rows.length === 0) continue
    cards.push({
      key: `q:${q.questionId}`,
      kind: 'question',
      questionId: q.questionId,
      title: q.title,
      category: q.category,
      venue: q.venue,
      underlying: q.underlying,
      expiresAt: q.expiresAt,
      rows,
      dayNtlVlm: vol,
      outcomeCount: rows.length
    })
  }

  for (const o of resolved.outcomes.values()) {
    if (o.questionId !== undefined || o.isFallback) continue
    const rows = o.sides.map((s) => rowFor(o, s, s.name, mids, ctxByCoin))
    cards.push({
      key: `o:${o.outcomeId}`,
      kind: 'outcome',
      outcomeId: o.outcomeId,
      title: o.title,
      category: o.category,
      venue: o.venue,
      underlying: o.underlying,
      expiresAt: o.expiresAt,
      rows,
      dayNtlVlm: rows.reduce((s, r) => s + r.dayNtlVlm, 0)
    })
  }

  return cards
}

export type CardFilters = {
  search?: string
  category?: OutcomeCategory | 'All'
  /** Venue code, `'hl'` for Hyperliquid-native only, or `'All'`. */
  venue?: string | 'All' | 'hl'
  favoriteKeys?: ReadonlySet<string>
  favoritesOnly?: boolean
}

export const filterOutcomeCards = (cards: OutcomeCard[], f: CardFilters): OutcomeCard[] => {
  const q = (f.search ?? '').trim().toLowerCase()
  return cards.filter((c) => {
    if (f.category && f.category !== 'All' && c.category !== f.category) return false
    if (f.venue && f.venue !== 'All') {
      if (f.venue === 'hl' ? c.venue !== null : c.venue !== f.venue) return false
    }
    if (f.favoritesOnly && !(f.favoriteKeys?.has(c.key) ?? false)) return false
    if (q) {
      const hay =
        `${c.title} ${c.venue ?? ''} ${c.rows.map((r) => r.label).join(' ')}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

/** Sort: favorites first, then 24h volume desc, then soonest expiry, then title. */
export const sortOutcomeCards = (
  cards: OutcomeCard[],
  favoriteKeys?: ReadonlySet<string>
): OutcomeCard[] =>
  [...cards].sort((a, b) => {
    const fa = favoriteKeys?.has(a.key) ? 1 : 0
    const fb = favoriteKeys?.has(b.key) ? 1 : 0
    if (fa !== fb) return fb - fa
    if (a.dayNtlVlm !== b.dayNtlVlm) return b.dayNtlVlm - a.dayNtlVlm
    const ea = a.expiresAt ?? Number.MAX_SAFE_INTEGER
    const eb = b.expiresAt ?? Number.MAX_SAFE_INTEGER
    if (ea !== eb) return ea - eb
    return a.title.localeCompare(b.title)
  })

export const groupCardsByCategory = (
  cards: OutcomeCard[],
  order: OutcomeCategory[]
): { category: OutcomeCategory; cards: OutcomeCard[] }[] =>
  order
    .map((category) => ({ category, cards: cards.filter((c) => c.category === category) }))
    .filter((g) => g.cards.length > 0)
