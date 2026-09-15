import { describe, expect, it } from 'vitest'
import { computeMaxDrawdownPercent } from './portfolioStats'

// A Hyperliquid account-value history point is [timestamp, value-as-string].
// We use small hand-built series to exercise the drawdown math directly.

describe('computeMaxDrawdownPercent (BUG-033)', () => {
  it('returns null on empty series (no data yet)', () => {
    expect(computeMaxDrawdownPercent([])).toBeNull()
  })

  it('returns null on single-point series (no dip possible)', () => {
    expect(computeMaxDrawdownPercent([[1, '100']])).toBeNull()
  })

  it('returns 0 for a flat series (never dropped)', () => {
    expect(
      computeMaxDrawdownPercent([
        [1, '100'],
        [2, '100'],
        [3, '100']
      ])
    ).toBe(0)
  })

  it('returns 0 for a monotonically increasing series (never dropped)', () => {
    expect(
      computeMaxDrawdownPercent([
        [1, '100'],
        [2, '110'],
        [3, '120']
      ])
    ).toBe(0)
  })

  it('BUG-033 core: series that STARTS at 0 (pre-first-deposit) is not treated as -100%', () => {
    // Old buggy behavior: (min - max) / max = (0 - 110) / 110 = -100%.
    // Correct behavior: 0 is the pre-deposit floor; the "peak" starts at 110
    // and never dropped afterward → 0%.
    const drawdown = computeMaxDrawdownPercent([
      [1, '0'],
      [2, '110']
    ])
    expect(drawdown).toBe(0)
  })

  it('classic peak-to-trough after peak: 100 → 110 → 90 → 105', () => {
    // Peak = 110, trough after peak = 90 → (90 - 110) / 110 = -0.1818…
    const drawdown = computeMaxDrawdownPercent([
      [1, '100'],
      [2, '110'],
      [3, '90'],
      [4, '105']
    ])
    expect(drawdown).toBeCloseTo(-18.1818, 3)
  })

  it('picks the WORST drawdown when there are multiple dips', () => {
    // 100 → 95 (−5%), then 120 → 108 (−10%). Worst = −10%.
    const drawdown = computeMaxDrawdownPercent([
      [1, '100'],
      [2, '95'],
      [3, '120'],
      [4, '108']
    ])
    expect(drawdown).toBeCloseTo(-10, 3)
  })
})
