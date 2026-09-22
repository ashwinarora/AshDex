import { describe, expect, it } from 'vitest'
import { META, TEMPLATES } from './__fixtures__/live'
import {
  buildOutcomeCards,
  filterOutcomeCards,
  groupCardsByCategory,
  sortOutcomeCards
} from './cards'
import { OUTCOME_CATEGORY_ORDER, resolveOutcomeMeta } from './template'

const resolved = resolveOutcomeMeta(META, TEMPLATES, { timeZone: 'UTC' })
const mids: Record<string, string> = {
  '#12100': '0.42',
  '#12101': '0.58',
  '#202030': '0.25',
  '#202040': '0.5',
  '#202050': '0.25',
  BTC: '81000'
}
const ctxs = [
  { coin: '#12100', markPx: '0.42', midPx: '0.42', prevDayPx: '0.4', dayNtlVlm: '100' },
  { coin: '#12101', markPx: '0.58', midPx: '0.58', prevDayPx: '0.6', dayNtlVlm: '50' },
  { coin: '#202030', markPx: '0.25', midPx: '0.25', prevDayPx: '0.3', dayNtlVlm: '10' },
  { coin: '#202031', markPx: '0.75', midPx: '0.75', prevDayPx: '0.7', dayNtlVlm: '5' },
  { coin: '@107', markPx: '40', midPx: '40', prevDayPx: '39', dayNtlVlm: '9999' }
]

describe('buildOutcomeCards', () => {
  const cards = buildOutcomeCards(resolved, mids, ctxs)

  it('makes one card per question and per standalone outcome, never for fallbacks', () => {
    const keys = cards.map((c) => c.key)
    expect(keys).toContain('q:1377')
    expect(keys).toContain('o:1210')
    expect(keys).not.toContain('o:20202')
    expect(keys).not.toContain('o:3016')
    expect(keys).not.toContain('o:20203') // question child is a row, not a card
  })

  it('standalone cards expose both sides with price, chance and multiple', () => {
    const c = cards.find((x) => x.key === 'o:1210')!
    expect(c.rows.map((r) => r.label)).toEqual(['Yes', 'No'])
    expect(c.rows[0]).toMatchObject({ coin: '#12100', price: 0.42, chance: 42, dayNtlVlm: 100 })
    expect(c.rows[0].multiple).toBeCloseTo(1 / 0.42)
    expect(c.dayNtlVlm).toBe(150)
    expect(c.venue).toBe('out')
    expect(c.underlying).toBe('BTC')
  })

  it('question cards list the Yes side of each named outcome and count both sides of volume', () => {
    const c = cards.find((x) => x.key === 'q:1377')!
    expect(c.kind).toBe('question')
    expect(c.outcomeCount).toBe(3)
    expect(c.rows.map((r) => r.label)).toEqual(['Below 79526', '79526 to 82772', 'Above 82772'])
    expect(c.rows.map((r) => r.coin)).toEqual(['#202030', '#202040', '#202050'])
    expect(c.rows[0].chance).toBe(25)
    expect(c.dayNtlVlm).toBe(15)
  })

  it('reports null price/chance when neither mids nor ctx know the coin', () => {
    const c = cards.find((x) => x.key === 'o:1209')!
    expect(c.rows[0].price).toBeNull()
    expect(c.rows[0].chance).toBeNull()
    expect(c.rows[0].multiple).toBeNull()
  })

  it('falls back to ctx mid when allMids lacks the coin', () => {
    const c = cards.find((x) => x.key === 'q:1377')!
    // '#202031' is a No side and not a row; instead check a Yes row with only ctx data:
    const only = buildOutcomeCards(resolved, {}, ctxs).find((x) => x.key === 'o:1210')!
    expect(only.rows[0].price).toBe(0.42)
    expect(c).toBeDefined()
  })
})

describe('filter / sort / group', () => {
  const cards = buildOutcomeCards(resolved, mids, ctxs)

  it('filters by category, venue (incl. Hyperliquid-native) and text', () => {
    expect(
      filterOutcomeCards(cards, { category: 'Sports' }).every((c) => c.category === 'Sports')
    ).toBe(true)
    expect(filterOutcomeCards(cards, { venue: 'txyz' }).every((c) => c.venue === 'txyz')).toBe(true)
    expect(filterOutcomeCards(cards, { venue: 'hl' }).every((c) => c.venue === null)).toBe(true)
    const hits = filterOutcomeCards(cards, { search: 'marseille' })
    expect(hits.map((c) => c.key)).toEqual(['q:271'])
    expect(filterOutcomeCards(cards, { search: 'anthropic' }).map((c) => c.key)).toEqual(['o:2597'])
  })

  it('favorites-only respects the key set', () => {
    const fav = new Set(['o:1210'])
    expect(
      filterOutcomeCards(cards, { favoritesOnly: true, favoriteKeys: fav }).map((c) => c.key)
    ).toEqual(['o:1210'])
  })

  it('sorts favorites first then by volume', () => {
    const sorted = sortOutcomeCards(cards, new Set(['o:2597']))
    expect(sorted[0].key).toBe('o:2597')
    expect(sorted[1].key).toBe('o:1210') // highest volume
  })

  it('groups by category in canonical order and drops empty groups', () => {
    const groups = groupCardsByCategory(cards, OUTCOME_CATEGORY_ORDER)
    expect(groups.map((g) => g.category)).toEqual(['Crypto', 'Economics', 'Tradfi', 'Sports'])
  })
})
