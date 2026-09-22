import { describe, expect, it } from 'vitest'
import { META, TEMPLATES } from './__fixtures__/live'
import {
  formatDateTimeLabel,
  formatNumberLabel,
  humanizeTemplateId,
  labelForEncoding,
  parseHlDateTime,
  parseKeyValues,
  parseTemplateMetadata,
  renderTemplateText,
  resolveOutcomeMeta,
  stripMetadataTail
} from './template'

const UTC = { timeZone: 'UTC' }

describe('parseKeyValues', () => {
  it('splits on | and only the first : of each segment', () => {
    expect(
      parseKeyValues(
        'perp:xyz:CL|priceDescription:xyz:CL|seconds:1|threshold:83.196|time:20260929-2100'
      )
    ).toEqual({
      perp: 'xyz:CL',
      priceDescription: 'xyz:CL',
      seconds: '1',
      threshold: '83.196',
      time: '20260929-2100'
    })
  })
  it('tolerates empty / plain-text descriptions', () => {
    expect(parseKeyValues('')).toEqual({})
    expect(parseKeyValues('other')).toEqual({})
    expect(parseKeyValues(undefined)).toEqual({})
  })
})

describe('keyword formatting', () => {
  it('parses HL dateTime and date forms as UTC', () => {
    expect(parseHlDateTime('20261001-0000')).toBe(Date.UTC(2026, 9, 1, 0, 0))
    expect(parseHlDateTime('20260712')).toBe(Date.UTC(2026, 6, 12, 23, 59))
    expect(parseHlDateTime('nope')).toBeNull()
  })
  it('renders dates like the official app', () => {
    expect(formatDateTimeLabel(Date.UTC(2026, 7, 29, 0, 0), UTC)).toBe('Aug 29 at 12:00 AM')
    expect(formatDateTimeLabel(Date.UTC(2026, 8, 20, 6, 0), UTC)).toBe('Sep 20 at 6:00 AM')
  })
  it('adds thousands separators without touching decimals', () => {
    expect(formatNumberLabel('100000')).toBe('100,000')
    expect(formatNumberLabel('0.74434')).toBe('0.74434')
    expect(formatNumberLabel('83.196')).toBe('83.196')
    expect(formatNumberLabel('8.5')).toBe('8.5')
    expect(formatNumberLabel('LSU')).toBe('LSU')
  })
  it('substitutes placeholders and turns "at {date}" into "on {date}"', () => {
    const t = TEMPLATES.find((x) => x.id === 'binaryPrice')!
    expect(
      renderTemplateText(
        t.name,
        parseKeyValues('perp:BTC|threshold:100000|time:20261001-0000'),
        Object.fromEntries(t.keywords),
        UTC
      )
    ).toBe('BTC above 100,000 on Oct 1 at 12:00 AM?')
  })
  it('leaves unknown placeholders untouched', () => {
    expect(renderTemplateText('{a} and {b}', { a: 'x' }, {})).toBe('x and {b}')
  })
  it('strips and parses the metadata tail', () => {
    const t = TEMPLATES.find((x) => x.id === 'sportsContestWinner')!
    expect(stripMetadataTail(t.description)).not.toContain('metadata=')
    expect(parseTemplateMetadata(t.description)).toMatchObject({
      category: 'sports',
      subCategory: '{sport}'
    })
  })
  it('humanizes template ids as a fallback title', () => {
    expect(humanizeTemplateId('sportsContestWinner')).toBe('Sports Contest Winner')
    expect(humanizeTemplateId('binaryPrice2')).toBe('Binary Price')
  })
})

describe('resolveOutcomeMeta', () => {
  const resolved = resolveOutcomeMeta(META, TEMPLATES, UTC)

  it('renders template-deployed standalone markets (title, sides, venue, fee scale, expiry)', () => {
    const o = resolved.outcomes.get(1210)!
    expect(o.title).toBe('BTC above 100,000 on Oct 1 at 12:00 AM?')
    expect(o.sides.map((s) => s.name)).toEqual(['Yes', 'No'])
    expect(o.sides[0]).toMatchObject({
      encoding: 12100,
      coin: '#12100',
      balanceCoin: '+12100',
      assetId: 100_012_100
    })
    expect(o.venue).toBe('out')
    expect(o.deployerFeeScale).toBe(1)
    expect(o.category).toBe('Crypto')
    expect(o.underlying).toBe('BTC')
    expect(o.expiresAt).toBe(Date.UTC(2026, 9, 1, 0, 0))
    expect(o.isFallback).toBe(false)
    expect(o.resolutionText).toContain('resolves to Yes if the BTC price is above 100,000')
    expect(o.resolutionText).not.toContain('metadata=')
  })

  it('classifies HIP-3 (dex-prefixed) perps as Tradfi and hides the dex prefix in titles', () => {
    const o = resolved.outcomes.get(1230)!
    expect(o.category).toBe('Tradfi')
    expect(o.title).toBe('CL above 83.196 on Sep 29 at 9:00 PM?')
    expect(o.underlying).toBe('CL')
  })

  it('keeps "by {time}" phrasing for touch markets', () => {
    expect(resolved.outcomes.get(1209)!.title).toBe('HYPE touches 100 by Oct 1 at 12:00 AM')
  })

  it('renders keyword side names ({shortNameA}/{shortNameB})', () => {
    const o = resolved.outcomes.get(3002)!
    expect(o.title).toBe('NCAAF Regular Season: LSU Tigers v Ole Miss Rebels')
    expect(o.sides.map((s) => s.name)).toEqual(['LSU', 'Ole Miss'])
    expect(o.category).toBe('Sports')
    expect(o.venue).toBe('txyz')
    expect(o.deployerFeeScale).toBe(0)
    // Expiry prefers the resolution deadline when no explicit time keyword exists.
    expect(o.expiresAt).toBe(Date.UTC(2026, 8, 20, 5, 30))
  })

  it('renders Over/Under and economics markets', () => {
    expect(resolved.outcomes.get(3940)!.title).toBe(
      'NFL: Browns vs Buccaneers: TB points minus CLE points over/under 8.5'
    )
    expect(resolved.outcomes.get(3940)!.sides.map((s) => s.name)).toEqual(['Over', 'Under'])
    const ipo = resolved.outcomes.get(2597)!
    expect(ipo.title).toBe('Anthropic IPO confirmed by Oct 31 at 11:59 PM')
    expect(ipo.category).toBe('Economics')
  })

  it('renders Hyperliquid-native recurring binaries with no venue', () => {
    const o = resolved.outcomes.get(4219)!
    expect(o.title).toBe('BTC above 81,081 on Sep 20 at 6:00 AM?')
    expect(o.venue).toBeNull()
    expect(o.deployerFeeScale).toBe(0)
    expect(o.category).toBe('Crypto')
    expect(o.underlying).toBe('BTC')
    expect(o.expiresAt).toBe(Date.UTC(2026, 8, 20, 6, 0))
    expect(o.resolutionText).toContain('Sep 20, 2026 06:00 UTC')
  })

  it('renders native price-bucket questions and their index:n children', () => {
    const q = resolved.questions.get(1377)!
    expect(q.title).toBe('BTC price range on Sep 20 at 6:00 AM?')
    expect(q.outcomeIds).toEqual([20203, 20204, 20205])
    expect(q.fallbackOutcomeId).toBe(20202)
    expect(resolved.outcomes.get(20203)!.outcomeLabel).toBe('Below 79526')
    expect(resolved.outcomes.get(20204)!.outcomeLabel).toBe('79526 to 82772')
    expect(resolved.outcomes.get(20205)!.outcomeLabel).toBe('Above 82772')
    expect(resolved.outcomes.get(20205)!.title).toBe(q.title)
    expect(resolved.outcomes.get(20202)!.isFallback).toBe(true)
    expect(resolved.outcomes.get(20202)!.outcomeLabel).toBe('Other')
    expect(q.resolutionText).toContain('Exactly one outcome will settle to $1')
  })

  it('renders template questions with participant / Draw children and a venue inherited from children', () => {
    const q = resolved.questions.get(271)!
    expect(q.title).toBe('LIGUE1 Regular Season: Paris Saint-Germain v Marseille')
    expect(q.venue).toBe('txyz')
    expect(q.category).toBe('Sports')
    expect(resolved.outcomes.get(3017)!.outcomeLabel).toBe('Paris Saint-Germain')
    expect(resolved.outcomes.get(3018)!.outcomeLabel).toBe('Draw')
    expect(resolved.outcomes.get(3019)!.outcomeLabel).toBe('Marseille')
    expect(resolved.outcomes.get(3016)!.isFallback).toBe(true)
    expect(resolved.outcomes.get(3017)!.questionId).toBe(271)
    expect(resolved.outcomes.get(3017)!.title).toBe(q.title)
  })

  it('labels tournament fallbacks "No winner"', () => {
    expect(resolved.questions.get(198)!.title).toBe('2026/2027 English Premier League winner')
    expect(resolved.outcomes.get(1473)!.outcomeLabel).toBe('Arsenal')
    expect(resolved.outcomes.get(1472)!.outcomeLabel).toBe('No winner')
  })

  it('passes validator-deployed plain-text markets through untouched', () => {
    expect(resolved.questions.get(500)!.title).toBe('2026 HYPURR World Cup winner')
    expect(resolved.outcomes.get(10233)!.outcomeLabel).toBe('Argentina')
    expect(resolved.outcomes.get(10233)!.category).toBe('Sports')
    const fed = resolved.outcomes.get(10225)!
    expect(fed.title).toBe('June Fed rate change')
    expect(fed.sides.map((s) => s.name)).toEqual(['Change', 'No Change'])
    expect(fed.category).toBe('Economics')
  })

  it('indexes every side by encoding and lists venues/categories present', () => {
    expect(resolved.byEncoding.get(12101)!.side.name).toBe('No')
    expect(resolved.byEncoding.get(30020)!.side.name).toBe('LSU')
    expect(resolved.venues).toEqual(['out', 'txyz'])
    expect(resolved.categories).toEqual(['Crypto', 'Economics', 'Tradfi', 'Sports'])
  })

  it('builds human labels for #enc coins used by orders/fills tables', () => {
    expect(labelForEncoding(resolved, 12100)).toBe('BTC above 100,000 on Oct 1 at 12:00 AM? · Yes')
    expect(labelForEncoding(resolved, 202031)).toBe(
      'BTC price range on Sep 20 at 6:00 AM? — Below 79526 · No'
    )
    expect(labelForEncoding(resolved, 202031, 'short')).toBe('Below 79526 · No')
    expect(labelForEncoding(resolved, 999999)).toBeUndefined()
  })

  it('is safe on empty input', () => {
    const empty = resolveOutcomeMeta(undefined, undefined)
    expect(empty.outcomes.size).toBe(0)
    expect(empty.venues).toEqual([])
  })
})
