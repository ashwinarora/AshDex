// Link from AshDex to hl-tools' multisig propose form, prefilled to approve a
// treasury agent. Only public identifiers go in the URL; the key stays here.
import type { Hex } from 'viem'
import type { HyperliquidNetwork } from '@/utils/tradingAccount'

/** Approval lengths hl-tools offers. Anything else falls back to the default. */
export const AGENT_DAYS_OPTIONS = [1, 7, 30, 90, 180] as const
export type AgentDays = (typeof AGENT_DAYS_OPTIONS)[number]
export const DEFAULT_AGENT_DAYS: AgentDays = 7

export const normalizeAgentDays = (days: number | undefined): AgentDays =>
  AGENT_DAYS_OPTIONS.includes(days as AgentDays) ? (days as AgentDays) : DEFAULT_AGENT_DAYS

/**
 * `<hltools>/multisig/propose?network=…&treasury=…&kind=approveAgent&agentAddress=…&agentName=…&agentDays=…`.
 * `agentName` has no ` valid_until` suffix: hl-tools adds it from the
 * proposal's own nonce and `agentDays`. Returns `null` when `hltoolsUrl` is
 * empty or unparseable, so callers can hide the link instead of dead-linking.
 */
export const buildApproveAgentProposeUrl = ({
  hltoolsUrl,
  network,
  treasury,
  agentAddress,
  agentName,
  agentDays
}: {
  hltoolsUrl: string
  network: HyperliquidNetwork
  treasury: Hex
  agentAddress: Hex
  agentName: string
  agentDays?: number
}): string | null => {
  return hltoolsLink(hltoolsUrl, '/multisig/propose', [
    ['network', network],
    ['treasury', treasury],
    ['kind', 'approveAgent'],
    ['agentAddress', agentAddress],
    ['agentName', agentName],
    ['agentDays', String(normalizeAgentDays(agentDays))]
  ])
}

/**
 * `<hltools>/multisig/propose?network=…&treasury=…&kind=removeAgent&agent=<name>`.
 * Hyperliquid removes an agent by name; pass the stored name (no suffix).
 */
export const buildRemoveAgentProposeUrl = ({
  hltoolsUrl,
  network,
  treasury,
  agentName
}: {
  hltoolsUrl: string
  network: HyperliquidNetwork
  treasury: Hex
  agentName: string
}): string | null =>
  hltoolsLink(hltoolsUrl, '/multisig/propose', [
    ['network', network],
    ['treasury', treasury],
    ['kind', 'removeAgent'],
    ['agent', agentName]
  ])

/** User-signed actions a treasury proposes in hl-tools instead of AshDex signing them. */
export type TreasuryProposeKind =
  | 'withdraw3'
  | 'sendUsdc'
  | 'sendToken'
  | 'usdClassTransfer'
  | 'accountMode'

/** hl-tools' send kind for a balance row: USDC sends are their own kind. */
export const treasurySendKind = (coin: string): 'sendUsdc' | 'sendToken' =>
  /^USDC(\((Perps|Spot)\))?$/.test(coin) ? 'sendUsdc' : 'sendToken'

/** `<hltools>/multisig/propose?network=…&treasury=…&kind=…`, or `null` without a usable base. */
export const buildTreasuryProposeUrl = ({
  hltoolsUrl,
  network,
  treasury,
  kind
}: {
  hltoolsUrl: string
  network: HyperliquidNetwork
  treasury: Hex
  kind: TreasuryProposeKind
}): string | null =>
  hltoolsLink(hltoolsUrl, '/multisig/propose', [
    ['network', network],
    ['treasury', treasury],
    ['kind', kind]
  ])

/** The treasury's page in hl-tools (`<hltools>/multisig/t/<network>/<treasury>`), used for deposits. */
export const buildTreasuryPageUrl = ({
  hltoolsUrl,
  network,
  treasury
}: {
  hltoolsUrl: string
  network: HyperliquidNetwork
  treasury: Hex
}): string | null => hltoolsLink(hltoolsUrl, `/multisig/t/${network}/${treasury}`, [])

/**
 * `path` under `hltoolsUrl` (keeping any base path), with `params` encoded by
 * encodeURIComponent (not URLSearchParams) so a space is `%20`, not `+`.
 */
const hltoolsLink = (
  hltoolsUrl: string,
  path: string,
  params: [string, string][]
): string | null => {
  const base = hltoolsUrl.trim()
  if (!base) return null
  let url: URL
  try {
    url = new URL(base)
  } catch {
    return null
  }
  url.pathname = `${url.pathname.replace(/\/+$/, '')}${path}`
  url.search = params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
  return url.toString()
}
