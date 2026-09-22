import {
  encodeOutcomeSide,
  toOutcomeAssetId,
  toOutcomeBalanceCoin,
  toOutcomeCoin
} from './encoding'
import type {
  OutcomeCategory,
  OutcomeTemplate,
  RawOutcome,
  RawOutcomeMeta,
  RawQuestion,
  ResolvedOutcome,
  ResolvedQuestion,
  ResolvedSide,
  TemplateKeywordType
} from './types'

/* ---------------------------------------------------------------------------
 * Description parsing
 * ------------------------------------------------------------------------- */

/**
 * Parse Hyperliquid's `key:value|key:value` description encoding.
 * Values may themselves contain ':' (e.g. "priceDescription:HYPE-USDC perp mark") so only
 * the first ':' of each segment separates key from value.
 */
export const parseKeyValues = (description: string | undefined | null): Record<string, string> => {
  const out: Record<string, string> = {}
  if (!description) return out
  for (const part of description.split('|')) {
    const idx = part.indexOf(':')
    if (idx <= 0) continue
    out[part.slice(0, idx)] = part.slice(idx + 1)
  }
  return out
}

/** Strip the `template:` prefix a template-deployed name/side carries. */
export const stripTemplatePrefix = (value: string): string =>
  value.startsWith('template:') ? value.slice('template:'.length) : value

export const isTemplateDeployed = (name: string): boolean => name.startsWith('template:')

/* ---------------------------------------------------------------------------
 * Keyword formatting
 * ------------------------------------------------------------------------- */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** `YYYYMMDD-HHMM` (UTC) or `YYYYMMDD` (end of day UTC) → ms since epoch, or null. */
export const parseHlDateTime = (value: string | undefined | null): number | null => {
  if (!value) return null
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:-(\d{2})(\d{2}))?$/)
  if (!m) return null
  const [, y, mo, d, h, mi] = m
  const ms = Date.UTC(
    Number(y),
    Number(mo) - 1,
    Number(d),
    h === undefined ? 23 : Number(h),
    mi === undefined ? 59 : Number(mi)
  )
  return Number.isFinite(ms) ? ms : null
}

export type FormatOptions = {
  /** IANA time zone used when rendering dates; defaults to the viewer's local zone. */
  timeZone?: string
}

/** "Sep 20 at 11:30 AM" in the requested (or local) zone — mirrors the official app. */
export const formatDateTimeLabel = (ms: number, opts: FormatOptions = {}): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: opts.timeZone
  }).formatToParts(new Date(ms))
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return `${get('month')} ${get('day')} at ${get('hour')}:${get('minute')} ${get('dayPeriod')}`
}

/** "Sep 20" in the requested (or local) zone. */
export const formatDateLabel = (ms: number, opts: FormatOptions = {}): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: opts.timeZone
  }).formatToParts(new Date(ms))
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return `${get('month')} ${get('day')}`
}

/** "Sep 20, 2026 06:00 UTC" — used in resolution text. */
export const formatUtcLabel = (ms: number): string => {
  const d = new Date(ms)
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()} ${hh}:${mm} UTC`
}

/** Thousands separators without touching the decimal part: "100000" → "100,000", "0.74434" stays. */
export const formatNumberLabel = (value: string): string => {
  if (!/^-?\d+(\.\d+)?$/.test(value)) return value
  const [int, frac] = value.split('.')
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return frac !== undefined ? `${grouped}.${frac}` : grouped
}

/** `xyz:CL` → `CL` for display; plain perps unchanged. */
export const displayPerpName = (perp: string): string => {
  const idx = perp.indexOf(':')
  return idx >= 0 ? perp.slice(idx + 1) : perp
}

export const formatKeyword = (
  value: string,
  type: TemplateKeywordType | undefined,
  opts: FormatOptions = {}
): string => {
  switch (type) {
    case 'dateTime': {
      const ms = parseHlDateTime(value)
      return ms === null ? value : formatDateTimeLabel(ms, opts)
    }
    case 'date': {
      const ms = parseHlDateTime(value)
      return ms === null ? value : formatDateLabel(ms, opts)
    }
    case 'uInt':
    case 'uDecimal':
      return formatNumberLabel(value)
    case 'hlPerp':
      return displayPerpName(value)
    default:
      return value
  }
}

/**
 * Substitute `{keyword}` placeholders. Dates read more naturally after "on" than after "at"
 * ("BTC above 70,000 on Aug 29 at 5:30 AM?"), which is also what the official app renders,
 * so a leading "at " before a date placeholder is rewritten to "on ".
 */
export const renderTemplateText = (
  text: string,
  values: Record<string, string>,
  keywordTypes: Record<string, TemplateKeywordType>,
  opts: FormatOptions = {}
): string => {
  let rendered = text.replace(
    /(\bat )?\{([A-Za-z0-9_]+)\}/g,
    (match, atPrefix: string | undefined, kw: string) => {
      const raw = values[kw]
      if (raw === undefined) return match
      const type = keywordTypes[kw]
      const formatted = formatKeyword(raw, type, opts)
      const isDate = type === 'dateTime' || type === 'date'
      return `${atPrefix ? (isDate ? 'on ' : atPrefix) : ''}${formatted}`
    }
  )
  // Templates that reference "{perp}" with a dex prefix keep the prefix in rules text; that's
  // fine there, but a title should never show "xyz:CL". Handled by formatKeyword above.
  rendered = rendered.replace(/\s{2,}/g, ' ').trim()
  return rendered
}

/** Drop the `metadata=…` tail Hyperliquid appends to template descriptions. */
export const stripMetadataTail = (description: string): string => {
  const idx = description.indexOf(' metadata=')
  return idx >= 0 ? description.slice(0, idx).trim() : description.trim()
}

/** `metadata=category:price|subCategory:{sport}|…` → { category, subCategory }. */
export const parseTemplateMetadata = (
  description: string
): { category?: string; subCategory?: string; semanticRestriction?: string } => {
  const idx = description.indexOf('metadata=')
  if (idx < 0) return {}
  const kv = parseKeyValues(description.slice(idx + 'metadata='.length))
  return {
    category: kv.category,
    subCategory: kv.subCategory,
    semanticRestriction: kv.semanticRestriction
  }
}

/* ---------------------------------------------------------------------------
 * Category
 * ------------------------------------------------------------------------- */

const categoryFromMetadata = (
  metaCategory: string | undefined,
  perp: string | undefined
): OutcomeCategory => {
  switch ((metaCategory ?? '').toLowerCase()) {
    case 'price':
      // HIP-3 builder perps (dex-prefixed, e.g. "xyz:CL") are tokenized stocks/commodities.
      return perp && perp.includes(':') ? 'Tradfi' : 'Crypto'
    case 'crypto':
      return 'Crypto'
    case 'economics':
    case 'economy':
    case 'finance':
      return 'Economics'
    case 'tradfi':
    case 'stocks':
    case 'commodities':
      return 'Tradfi'
    case 'sports':
    case 'sport':
      return 'Sports'
    case 'technology':
    case 'tech':
    case 'ai':
      return 'Tech'
    default:
      return 'Other'
  }
}

export const OUTCOME_CATEGORY_ORDER: OutcomeCategory[] = [
  'Crypto',
  'Economics',
  'Tradfi',
  'Sports',
  'Tech',
  'Other'
]

/* ---------------------------------------------------------------------------
 * Native (protocol-deployed "Recurring") markets
 * ------------------------------------------------------------------------- */

const isNativeRecurring = (o: RawOutcome): boolean =>
  o.description.startsWith('class:priceBinary') || o.name === 'Recurring'

const nativeBinaryTitle = (kv: Record<string, string>, opts: FormatOptions): string => {
  const expiry = parseHlDateTime(kv.expiry)
  const when = expiry === null ? kv.expiry : formatDateTimeLabel(expiry, opts)
  return `${kv.underlying} above ${formatNumberLabel(kv.targetPrice ?? '')} on ${when}?`
}

const nativeBinaryResolution = (kv: Record<string, string>): string => {
  const expiry = parseHlDateTime(kv.expiry)
  const when = expiry === null ? kv.expiry : formatUtcLabel(expiry)
  return (
    `The ${kv.underlying}-USDC mark price at ${when} will be used to determine settlement. ` +
    `Yes settles to $1 if the mark price is at or above ${formatNumberLabel(kv.targetPrice ?? '')}, ` +
    `and otherwise settles to $0. No settles to $1 minus the Yes settlement. ` +
    `The settlement price is interpolated between the two mark-price updates immediately before and after the expiry time.`
  )
}

const nativeBucketTitle = (kv: Record<string, string>, opts: FormatOptions): string => {
  const expiry = parseHlDateTime(kv.expiry)
  const when = expiry === null ? kv.expiry : formatDateTimeLabel(expiry, opts)
  return `${kv.underlying} price range on ${when}?`
}

const nativeBucketLabels = (kv: Record<string, string>): string[] => {
  const [p1, p2] = (kv.priceThresholds ?? '').split(',')
  return [`Below ${p1}`, `${p1} to ${p2}`, `Above ${p2}`]
}

const nativeBucketResolution = (kv: Record<string, string>): string => {
  const expiry = parseHlDateTime(kv.expiry)
  const when = expiry === null ? kv.expiry : formatUtcLabel(expiry)
  const [p1, p2] = (kv.priceThresholds ?? '').split(',')
  return (
    `The ${kv.underlying}-USDC mark price at ${when} will be used to determine which outcome settles to $1. At settlement: ` +
    `Below ${p1}-Yes settles to $1 if the mark price is below ${p1}, and otherwise settles to $0. ` +
    `${p1} to ${p2}-Yes settles to $1 if the mark price is at least ${p1} and less than ${p2}, and otherwise settles to $0. ` +
    `Above ${p2}-Yes settles to $1 if the mark price is at least ${p2}, and otherwise settles to $0. ` +
    `Exactly one outcome will settle to $1. All other outcomes settle to $0.`
  )
}

/* ---------------------------------------------------------------------------
 * Resolution
 * ------------------------------------------------------------------------- */

export type TemplateIndex = Map<string, OutcomeTemplate>

export const indexTemplates = (templates: OutcomeTemplate[] | undefined | null): TemplateIndex =>
  new Map((templates ?? []).map((t) => [t.id, t]))

const keywordTypesOf = (t: OutcomeTemplate | undefined): Record<string, TemplateKeywordType> =>
  Object.fromEntries(t?.keywords ?? [])

const makeSides = (outcomeId: number, names: [string, string]): [ResolvedSide, ResolvedSide] =>
  ([0, 1] as const).map((side) => {
    const encoding = encodeOutcomeSide(outcomeId, side)
    return {
      side,
      name: names[side],
      encoding,
      coin: toOutcomeCoin(encoding),
      balanceCoin: toOutcomeBalanceCoin(encoding),
      assetId: toOutcomeAssetId(encoding)
    }
  }) as [ResolvedSide, ResolvedSide]

/** Pick the keyword that best represents "when does this settle" for a template instance. */
const EXPIRY_KEYWORDS = ['time', 'dateTime', 'expiry', 'decisionDeadline', 'resolutionDeadline']

const expiryFromKeywords = (kv: Record<string, string>): number | undefined => {
  for (const k of EXPIRY_KEYWORDS) {
    const ms = parseHlDateTime(kv[k])
    if (ms !== null) return ms
  }
  return undefined
}

const parseFeeScale = (value: string | null | undefined): number => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const renderSideNames = (
  outcome: RawOutcome,
  kv: Record<string, string>,
  keywordTypes: Record<string, TemplateKeywordType>,
  opts: FormatOptions
): [string, string] => {
  const [a, b] = outcome.sideSpecs
  const render = (spec: { name: string } | undefined, fallback: string) =>
    spec ? renderTemplateText(stripTemplatePrefix(spec.name), kv, keywordTypes, opts) : fallback
  return [render(a, 'Yes'), render(b, 'No')]
}

export type ResolvedOutcomeMeta = {
  outcomes: Map<number, ResolvedOutcome>
  questions: Map<number, ResolvedQuestion>
  /** encoding → resolved outcome + side, for `#enc` / `+enc` lookups. */
  byEncoding: Map<number, { outcome: ResolvedOutcome; side: ResolvedSide }>
  venues: string[]
  categories: OutcomeCategory[]
}

/**
 * Turn raw `outcomeMeta` + `outcomeTemplates` into display-ready structures.
 * Pure; safe to memoize on the two inputs.
 */
export const resolveOutcomeMeta = (
  meta: RawOutcomeMeta | undefined | null,
  templates: OutcomeTemplate[] | undefined | null,
  opts: FormatOptions = {}
): ResolvedOutcomeMeta => {
  const outcomes = new Map<number, ResolvedOutcome>()
  const questions = new Map<number, ResolvedQuestion>()
  const byEncoding = new Map<number, { outcome: ResolvedOutcome; side: ResolvedSide }>()
  const venues = new Set<string>()
  const categories = new Set<OutcomeCategory>()
  if (!meta) return { outcomes, questions, byEncoding, venues: [], categories: [] }

  const templateIndex = indexTemplates(templates)
  const questionByOutcome = new Map<number, RawQuestion>()
  for (const q of meta.questions) {
    for (const id of q.namedOutcomes) questionByOutcome.set(id, q)
    questionByOutcome.set(q.fallbackOutcome, q)
  }

  // Questions first so children can inherit their title/category/expiry.
  for (const q of meta.questions) {
    const rq = resolveQuestion(q, meta, templateIndex, opts)
    questions.set(q.question, rq)
  }

  for (const o of meta.outcomes) {
    const q = questionByOutcome.get(o.outcome)
    const rq = q ? questions.get(q.question) : undefined
    const ro = resolveOutcome(o, q, rq, templateIndex, opts)
    outcomes.set(o.outcome, ro)
    for (const side of ro.sides) byEncoding.set(side.encoding, { outcome: ro, side })
    if (ro.venue) venues.add(ro.venue)
    if (!ro.isFallback) categories.add(ro.category)
  }

  return {
    outcomes,
    questions,
    byEncoding,
    venues: [...venues].sort(),
    categories: OUTCOME_CATEGORY_ORDER.filter((c) => categories.has(c))
  }
}

const resolveQuestion = (
  q: RawQuestion,
  meta: RawOutcomeMeta,
  templateIndex: TemplateIndex,
  opts: FormatOptions
): ResolvedQuestion => {
  const kv = parseKeyValues(q.description)
  const namedOutcomes = meta.outcomes.filter((o) => q.namedOutcomes.includes(o.outcome))
  // Venue is stamped on outcomes, not questions; every child shares it.
  const venue = namedOutcomes.find((o) => o.venue)?.venue ?? null

  if (isTemplateDeployed(q.name)) {
    const templateId = stripTemplatePrefix(q.name)
    const t = templateIndex.get(templateId)
    const types = keywordTypesOf(t)
    const metadata = parseTemplateMetadata(t?.description ?? '')
    return {
      questionId: q.question,
      title: t ? renderTemplateText(t.name, kv, types, opts) : humanizeTemplateId(templateId),
      category: categoryFromMetadata(metadata.category, kv.perp),
      venue,
      expiresAt: expiryFromKeywords(kv),
      underlying: kv.perp ? displayPerpName(kv.perp) : undefined,
      underlyingCoin: kv.perp,
      resolutionText: t
        ? renderTemplateText(stripMetadataTail(t.description), kv, types, opts)
        : q.description,
      outcomeIds: q.namedOutcomes,
      fallbackOutcomeId: q.fallbackOutcome,
      settledOutcomeIds: q.settledNamedOutcomes,
      templateId
    }
  }

  if (kv.class === 'priceBucket') {
    return {
      questionId: q.question,
      title: nativeBucketTitle(kv, opts),
      category: 'Crypto',
      venue,
      expiresAt: parseHlDateTime(kv.expiry) ?? undefined,
      underlying: kv.underlying,
      underlyingCoin: kv.underlying,
      resolutionText: nativeBucketResolution(kv),
      outcomeIds: q.namedOutcomes,
      fallbackOutcomeId: q.fallbackOutcome,
      settledOutcomeIds: q.settledNamedOutcomes
    }
  }

  // Validator-deployed categorical questions (testnet "HYPURR World Cup" etc.) carry plain text.
  return {
    questionId: q.question,
    title: q.name,
    category: guessCategoryFromText(`${q.name} ${q.description}`),
    venue,
    expiresAt: undefined,
    resolutionText: q.description,
    outcomeIds: q.namedOutcomes,
    fallbackOutcomeId: q.fallbackOutcome,
    settledOutcomeIds: q.settledNamedOutcomes
  }
}

const resolveOutcome = (
  o: RawOutcome,
  q: RawQuestion | undefined,
  rq: ResolvedQuestion | undefined,
  templateIndex: TemplateIndex,
  opts: FormatOptions
): ResolvedOutcome => {
  const kv = parseKeyValues(o.description)
  const isFallback = !!q && q.fallbackOutcome === o.outcome
  const venue = o.venue ?? rq?.venue ?? null
  const deployerFeeScale = parseFeeScale(o.deployerFeeScale)
  const base = {
    outcomeId: o.outcome,
    questionId: q?.question,
    venue,
    deployerFeeScale,
    isFallback,
    quoteToken: o.quoteToken
  }

  // ---- question children -------------------------------------------------
  if (rq) {
    let outcomeLabel: string
    if (isFallback) {
      outcomeLabel = rq.templateId === 'sportsTournamentWinner' ? 'No winner' : 'Other'
    } else if (isTemplateDeployed(o.name)) {
      const t = templateIndex.get(stripTemplatePrefix(o.name))
      outcomeLabel = t
        ? renderTemplateText(t.name, kv, keywordTypesOf(t), opts)
        : (kv.participant ?? humanizeTemplateId(stripTemplatePrefix(o.name)))
    } else if (kv.index !== undefined && rq.templateId === undefined) {
      // Native price-bucket child: "index:0|1|2"
      const qkv = parseKeyValues(q?.description)
      outcomeLabel = nativeBucketLabels(qkv)[Number(kv.index)] ?? o.name
    } else {
      outcomeLabel = o.name
    }
    const t = isTemplateDeployed(o.name)
      ? templateIndex.get(stripTemplatePrefix(o.name))
      : undefined
    const sideNames = renderSideNames(o, kv, keywordTypesOf(t), opts)
    return {
      ...base,
      title: rq.title,
      outcomeLabel,
      sides: makeSides(o.outcome, sideNames),
      category: rq.category,
      expiresAt: rq.expiresAt,
      underlying: rq.underlying,
      underlyingCoin: rq.underlyingCoin,
      resolutionText:
        t && !isFallback
          ? `${renderTemplateText(stripMetadataTail(t.description), kv, keywordTypesOf(t), opts)}\n\n${rq.resolutionText}`
          : rq.resolutionText,
      templateId: rq.templateId
    }
  }

  // ---- template-deployed standalone --------------------------------------
  if (isTemplateDeployed(o.name)) {
    const templateId = stripTemplatePrefix(o.name)
    const t = templateIndex.get(templateId)
    const types = keywordTypesOf(t)
    const metadata = parseTemplateMetadata(t?.description ?? '')
    const sideNames = renderSideNames(o, kv, types, opts)
    return {
      ...base,
      title: t ? renderTemplateText(t.name, kv, types, opts) : humanizeTemplateId(templateId),
      sides: makeSides(o.outcome, sideNames),
      category: categoryFromMetadata(metadata.category, kv.perp),
      expiresAt: expiryFromKeywords(kv),
      underlying: kv.perp ? displayPerpName(kv.perp) : undefined,
      underlyingCoin: kv.perp,
      resolutionText: t
        ? renderTemplateText(stripMetadataTail(t.description), kv, types, opts)
        : o.description,
      templateId
    }
  }

  // ---- native recurring binary -------------------------------------------
  if (isNativeRecurring(o) && kv.class === 'priceBinary') {
    return {
      ...base,
      title: nativeBinaryTitle(kv, opts),
      sides: makeSides(o.outcome, renderSideNames(o, kv, {}, opts)),
      category: 'Crypto',
      expiresAt: parseHlDateTime(kv.expiry) ?? undefined,
      underlying: kv.underlying,
      underlyingCoin: kv.underlying,
      resolutionText: nativeBinaryResolution(kv)
    }
  }

  // ---- anything else (validator-deployed plain-text outcomes) ------------
  return {
    ...base,
    title: o.name,
    sides: makeSides(o.outcome, renderSideNames(o, kv, {}, opts)),
    category: guessCategoryFromText(`${o.name} ${o.description}`),
    expiresAt: undefined,
    resolutionText: o.description
  }
}

/** "sportsContestWinner" → "Sports Contest Winner" (last-resort title when a template is unknown). */
export const humanizeTemplateId = (id: string): string =>
  id
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/(\d+)$/, '')
    .replace(/^./, (c) => c.toUpperCase())
    .trim()

const guessCategoryFromText = (text: string): OutcomeCategory => {
  const t = text.toLowerCase()
  if (/\b(fed|fomc|cpi|rate|inflation|gdp|unemployment|treasury|ecb|boe|boj)\b/.test(t))
    return 'Economics'
  if (/\b(world cup|cup|league|match|game|season|championship|nba|nfl|mlb|nhl|premier)\b/.test(t))
    return 'Sports'
  if (/\b(btc|eth|sol|hype|bitcoin|ethereum|crypto|token)\b/.test(t)) return 'Crypto'
  if (/\b(model|ai|llm|leaderboard|benchmark)\b/.test(t)) return 'Tech'
  return 'Other'
}

/* ---------------------------------------------------------------------------
 * Convenience lookups
 * ------------------------------------------------------------------------- */

/** "BTC above 70,000 on Aug 29 at 5:30 AM? — Yes" style label for a `#enc` coin. */
export const labelForEncoding = (
  resolved: ResolvedOutcomeMeta,
  encoding: number,
  style: 'full' | 'short' = 'full'
): string | undefined => {
  const hit = resolved.byEncoding.get(encoding)
  if (!hit) return undefined
  const { outcome, side } = hit
  const head = outcome.outcomeLabel ? `${outcome.outcomeLabel}` : outcome.title
  if (style === 'short') return `${head} · ${side.name}`
  return outcome.outcomeLabel
    ? `${outcome.title} — ${outcome.outcomeLabel} · ${side.name}`
    : `${outcome.title} · ${side.name}`
}
