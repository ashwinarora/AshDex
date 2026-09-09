/**
 * Hyperliquid account-value history point: `[timestamp_ms, value_as_string]`.
 * The value comes as a string over the wire, so callers may pass either
 * already-parsed numbers or the raw string.
 */
export type AccountValuePoint = readonly [time: number, value: string | number]

/**
 * Compute the worst peak-to-trough drawdown of an account-value time series,
 * as a percentage (negative number). Returns 0 when the series never dropped,
 * and `null` when a drawdown can't be defined (empty or single-point series,
 * or no positive value ever seen).
 *
 * Fixes BUG-033: the old inline calc was `(min - max) / max`, which returns
 * -100% when the series starts at 0 (pre-first-deposit state) — a
 * user-visible lie ("you lost all your equity") on brand-new accounts.
 *
 * Non-positive values are skipped rather than treated as peaks, so a leading
 * 0 doesn't anchor a spurious -100% drop.
 */
export function computeMaxDrawdownPercent(series: ReadonlyArray<AccountValuePoint>): number | null {
  if (series.length < 2) return null

  let peak = 0
  let maxDrawdown = 0
  let seenAnyPositive = false

  for (const [, rawValue] of series) {
    const v = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue)
    if (!Number.isFinite(v) || v <= 0) continue
    seenAnyPositive = true
    if (v > peak) peak = v
    // peak is guaranteed positive here (v > 0 above)
    const drawdownPct = ((v - peak) / peak) * 100
    if (drawdownPct < maxDrawdown) maxDrawdown = drawdownPct
  }

  return seenAnyPositive ? maxDrawdown : null
}
