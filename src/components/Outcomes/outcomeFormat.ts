/** Small formatters shared by Outcomes components. */

export const formatChance = (chance: number | null): string =>
  chance === null ? '--' : `${Math.round(chance)}%`

export const formatMultiple = (multiple: number | null): string =>
  multiple === null ? '--' : `${multiple.toFixed(2)}x`

export const formatOutcomePx = (px: number | null | undefined): string =>
  px === null || px === undefined || !Number.isFinite(px) ? '--' : px.toFixed(5)

export const formatUsd = (v: number | null | undefined, digits = 2): string =>
  v === null || v === undefined || !Number.isFinite(v)
    ? '--'
    : `$${v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`

export const formatUsdCompact = (v: number): string => {
  if (!Number.isFinite(v)) return '$0'
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`
  if (v >= 10_000) return `$${(v / 1_000).toFixed(1)}K`
  return `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export const formatShares = (v: number | null | undefined): string =>
  v === null || v === undefined || !Number.isFinite(v)
    ? '--'
    : v.toLocaleString('en-US', { maximumFractionDigits: 2 })

export const venueLabel = (venue: string | null | undefined): string =>
  venue ? venue : 'Hyperliquid'

/** "12h 17m 55s" until `ms`, or "Expired". */
export const formatCountdown = (ms: number | undefined, now = Date.now()): string => {
  if (ms === undefined) return '--'
  const diff = ms - now
  if (diff <= 0) return 'Expired'
  const s = Math.floor(diff / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${sec}s`
  return `${m}m ${sec}s`
}

export const outcomeTradeHref = (outcomeId: number, side: 0 | 1 = 0): string =>
  `/outcomes/${outcomeId}/${side === 0 ? 'yes' : 'no'}`
