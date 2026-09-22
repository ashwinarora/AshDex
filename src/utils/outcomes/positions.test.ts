import { describe, expect, it } from 'vitest'
import { META, TEMPLATES } from './__fixtures__/live'
import { deriveOutcomePositions, quoteAvailable, sideAvailable } from './positions'
import { resolveOutcomeMeta } from './template'

const resolved = resolveOutcomeMeta(META, TEMPLATES, { timeZone: 'UTC' })

// Shape copied from a live mainnet spotClearinghouseState (outcome rows carry no `token`).
const balances = [
  { coin: 'USDC', token: 0, total: '445.57398093', hold: '22.98002', entryNtl: '0.0' },
  { coin: '+12100', total: '330.0', hold: '30.0', entryNtl: '132.0' }, // BTC>100k Yes, avg 0.40
  { coin: '+12101', total: '0.0', hold: '0.0', entryNtl: '0.0' },
  { coin: '+43130', total: '5.0', hold: '0.0', entryNtl: '2.5' }, // unknown to meta → remnant
  { coin: 'o1209', total: '12.0', hold: '0.0', entryNtl: '0.0' }
]

describe('deriveOutcomePositions', () => {
  const { positions, remnants } = deriveOutcomePositions(
    balances,
    resolved,
    { '#12100': '0.5' },
    []
  )

  it('turns +enc balances into positions with avg/mark/PnL/payout', () => {
    expect(positions).toHaveLength(1)
    const p = positions[0]
    expect(p.coin).toBe('#12100')
    expect(p.balanceCoin).toBe('+12100')
    expect(p.outcome.outcomeId).toBe(1210)
    expect(p.side.name).toBe('Yes')
    expect(p.size).toBe(330)
    expect(p.hold).toBe(30)
    expect(p.avgPx).toBeCloseTo(0.4)
    expect(p.markPx).toBe(0.5)
    expect(p.value).toBeCloseTo(165)
    expect(p.pnl).toBeCloseTo(33)
    expect(p.pnlPct).toBeCloseTo(25)
    expect(p.payoutIfWins).toBe(330)
    expect(p.maxLoss).toBe(132)
  })

  it('skips zero balances and USDC, reports unknown/settled rows as remnants', () => {
    expect(remnants).toEqual([
      { coin: '+43130', total: 5, encoding: 43130 },
      { coin: 'o1209', total: 12, encoding: null }
    ])
  })

  it('handles missing marks without NaN', () => {
    const { positions: p } = deriveOutcomePositions(balances, resolved, {}, [])
    expect(p[0].markPx).toBeNull()
    expect(p[0].value).toBeNull()
    expect(p[0].pnl).toBeNull()
    expect(p[0].pnlPct).toBeNull()
  })

  it('computes available quote and side balances net of holds', () => {
    expect(quoteAvailable(balances)).toBeCloseTo(422.59396093)
    expect(sideAvailable(balances, '+12100')).toBe(300)
    expect(sideAvailable(balances, '+99999')).toBe(0)
  })
})
