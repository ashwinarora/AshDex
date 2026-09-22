import type { OutcomeMetaResponse } from '@nktkas/hyperliquid/api/info'

/** One live outcome as returned by `info.outcomeMeta()` (plus the venue fields mainnet emits). */
export type RawOutcome = OutcomeMetaResponse['outcomes'][number] & {
  /** Deployer venue (2–4 lowercase letters). Absent/null for Hyperliquid-native markets. */
  venue?: string | null
  /** Fee multiplier chosen by the deployer, e.g. "1.0". Absent for native markets. */
  deployerFeeScale?: string | null
}

export type RawQuestion = OutcomeMetaResponse['questions'][number]

export type RawOutcomeMeta = { outcomes: RawOutcome[]; questions: RawQuestion[] }

/** Keyword value formats a template can declare. The SDK type lists a subset; live data has more. */
export type TemplateKeywordType =
  | 'dateTime'
  | 'date'
  | 'string'
  | 'shortString'
  | 'hlPerp'
  | 'uInt'
  | 'uDecimal'
  | (string & {})

export type OutcomeTemplateRole =
  | 'question'
  | { standaloneOutcome: { sideNames: [string, string] } }
  | { questionOutcome: { parent: string } }

/** One entry of `info.outcomeTemplates()`. */
export type OutcomeTemplate = {
  id: string
  role: OutcomeTemplateRole
  /** Display text containing `{keyword}` placeholders. */
  name: string
  /** Long-form resolution rules, also with placeholders; may end in a `metadata=…` tail. */
  description: string
  keywords: [string, TemplateKeywordType][]
}

export type OutcomeCategory = 'Crypto' | 'Tradfi' | 'Economics' | 'Sports' | 'Tech' | 'Other'

export type ResolvedSide = {
  side: 0 | 1
  /** Human label: "Yes", "No", "Long", "Over", "LSU", … */
  name: string
  encoding: number
  /** `#enc` — market data / order coin. */
  coin: string
  /** `+enc` — balance coin. */
  balanceCoin: string
  assetId: number
}

/** Everything the UI needs to show one outcome without touching raw meta again. */
export type ResolvedOutcome = {
  outcomeId: number
  /** Set when the outcome is a named (or fallback) outcome of a categorical question. */
  questionId?: number
  /**
   * Card / page title. For question children this is the *question's* title
   * ("BTC price range on Sep 20 at 11:30 AM?"); the per-outcome label lives in `outcomeLabel`.
   */
  title: string
  /** For question children: "Below 79526", "Arsenal", "Draw". Undefined for standalone outcomes. */
  outcomeLabel?: string
  sides: [ResolvedSide, ResolvedSide]
  category: OutcomeCategory
  /** Venue code, or null for Hyperliquid-native markets. */
  venue: string | null
  /** Parsed `deployerFeeScale`; 0 for native markets. */
  deployerFeeScale: number
  /** Expiry / settlement deadline in ms since epoch when it can be derived. */
  expiresAt?: number
  /** Perp coin the market references, for icons (dex prefix stripped), when any. */
  underlying?: string
  /** Raw perp coin as spelled in `allMids` (e.g. "xyz:CL"), for live price lookups. */
  underlyingCoin?: string
  /** Rendered resolution rules for the Details modal. */
  resolutionText: string
  /** Question-level fallback ("Other" / "No winner"); hidden from grids, kept for merge/negate. */
  isFallback: boolean
  quoteToken: string
  /** Raw template id (without the `template:` prefix) when template-deployed. */
  templateId?: string
}

export type ResolvedQuestion = {
  questionId: number
  title: string
  category: OutcomeCategory
  venue: string | null
  expiresAt?: number
  underlying?: string
  underlyingCoin?: string
  resolutionText: string
  /** Named outcomes in display order (fallback excluded). */
  outcomeIds: number[]
  fallbackOutcomeId: number
  settledOutcomeIds: number[]
  templateId?: string
}
