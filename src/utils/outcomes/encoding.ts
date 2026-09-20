import { OUTCOME_ASSET_OFFSET } from '@/utils/constants'

/**
 * HIP-4 outcome share identifiers.
 *
 * Hyperliquid addresses a single side of an outcome with one integer:
 *   encoding = 10 * outcome + side          (side 0 = first sideSpec, usually "Yes")
 * and spells that integer three ways depending on the API surface:
 *   `#<enc>`  market data (allMids, l2Book, trades, candle, fills, open orders)
 *   `+<enc>`  balances in spotClearinghouseState / spotState
 *   OUTCOME_ASSET_OFFSET + enc   the `a` field of an /exchange order
 * Settled remnants show up in balances as `o<outcome>`.
 */

export type OutcomeSide = 0 | 1

export const encodeOutcomeSide = (outcome: number, side: OutcomeSide): number => 10 * outcome + side

export const decodeOutcomeEncoding = (enc: number): { outcome: number; side: OutcomeSide } => ({
  outcome: Math.floor(enc / 10),
  side: (enc % 10) as OutcomeSide
})

export const toOutcomeCoin = (enc: number): string => `#${enc}`
export const toOutcomeBalanceCoin = (enc: number): string => `+${enc}`
export const toOutcomeAssetId = (enc: number): number => OUTCOME_ASSET_OFFSET + enc

/** `#123` / `+123` / `123` (string or number) → 123, or `null` when it's not an outcome encoding. */
export const parseOutcomeEncoding = (coin: string | number | null | undefined): number | null => {
  if (coin === null || coin === undefined) return null
  if (typeof coin === 'number') return Number.isInteger(coin) && coin >= 0 ? coin : null
  const m = coin.match(/^[#+]?(\d+)$/)
  if (!m) return null
  return Number(m[1])
}

/** True for the `#…` market-data spelling (what orders, fills and books use). */
export const isOutcomeCoin = (coin: string | null | undefined): boolean =>
  typeof coin === 'string' && /^#\d+$/.test(coin)

/** True for the `+…` balance spelling. */
export const isOutcomeBalanceCoin = (coin: string | null | undefined): boolean =>
  typeof coin === 'string' && /^\+\d+$/.test(coin)

/** True for the `o…` settled-remnant balance spelling. */
export const isSettledOutcomeBalanceCoin = (coin: string | null | undefined): boolean =>
  typeof coin === 'string' && /^o\d+$/.test(coin)

/** `#120` → `#121` (and back). */
export const oppositeSideCoin = (coin: string): string => {
  const enc = parseOutcomeEncoding(coin)
  if (enc === null) return coin
  const { outcome, side } = decodeOutcomeEncoding(enc)
  return toOutcomeCoin(encodeOutcomeSide(outcome, side === 0 ? 1 : 0))
}
