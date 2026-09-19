// TWAP order helpers — pure logic, no side effects.
// Server constraints and defaults are documented at
// https://hyperliquid.gitbook.io/hyperliquid-docs/trading/order-types

// Hyperliquid's own UI (and its server) accepts TWAPs up to 7 days.
// The `@nktkas/hyperliquid` valibot schema historically capped `m` at 1440
// minutes (24h); we patch it up to 10080 via `patches/@nktkas%2Fhyperliquid…`.
// See CLAUDE.md and the plan file for the rationale (BUG-05). Upstream PR
// follow-up: relax the schema in the SDK so the patch can be dropped.
export const TWAP_MIN_MINUTES = 5
export const TWAP_MAX_MINUTES = 10080
export const TWAP_MIN_NOTIONAL_USDC = 100
export const TWAP_SUBORDER_INTERVAL_SECONDS = 30

export function minutesFromDHM(days: number, hours: number, minutes: number): number {
  const d = Number.isFinite(days) && days > 0 ? Math.floor(days) : 0
  const h = Number.isFinite(hours) && hours > 0 ? Math.floor(hours) : 0
  const m = Number.isFinite(minutes) && minutes > 0 ? Math.floor(minutes) : 0
  return d * 24 * 60 + h * 60 + m
}

export function isValidDuration(totalMinutes: number): boolean {
  return (
    Number.isFinite(totalMinutes) &&
    totalMinutes >= TWAP_MIN_MINUTES &&
    totalMinutes <= TWAP_MAX_MINUTES
  )
}

export function suborderCount(minutes: number): number {
  if (!Number.isFinite(minutes) || minutes < TWAP_MIN_MINUTES) return 1
  // Hyperliquid schedules a suborder every 30s and includes the tail — match
  // the "~" figure the official UI shows (0.002 BTC / 5 min → 11 suborders).
  return Math.floor((minutes * 60) / TWAP_SUBORDER_INTERVAL_SECONDS) + 1
}

export function suborderSize(totalSize: number, minutes: number): number {
  if (!Number.isFinite(totalSize) || totalSize <= 0) return 0
  const n = suborderCount(minutes)
  return n > 0 ? totalSize / n : 0
}

export function meetsMinNotional(size: number, markPrice: number): boolean {
  if (!Number.isFinite(size) || !Number.isFinite(markPrice)) return false
  return size * markPrice >= TWAP_MIN_NOTIONAL_USDC
}

// Trigger `above` flag matches the Hyperliquid UI's (Above)/(Below) suffix:
// true when the entered trigger is greater than the current mark, else false.
export function triggerDirection(triggerPrice: number, markPrice: number): boolean {
  return triggerPrice > markPrice
}
