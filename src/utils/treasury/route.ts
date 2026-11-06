import type { Hex } from 'viem'
import type { HyperliquidNetwork } from '@/utils/tradingAccount'
import { buildNetworkSwitchUrl } from '@/utils/networkSwitch'

/** In-app link to the treasury setup page (`/treasury?network=…&treasury=…`). */
export const treasuryPageHref = (network: HyperliquidNetwork, treasury?: Hex): string => {
  const params = new URLSearchParams({ network })
  if (treasury) params.set('treasury', treasury)
  return `/treasury?${params.toString()}`
}

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/

export const isHexAddress = (value: string): value is Hex => ADDRESS_RE.test(value)

/** What `/treasury?network=…&treasury=…&agent=…` asks for. */
export type TreasuryRoute =
  /** No treasury yet: show the address input. */
  | { kind: 'pick'; network: HyperliquidNetwork }
  | { kind: 'treasury'; network: HyperliquidNetwork; treasury: Hex; agent: Hex | null }
  /** The link is for the other network's build. */
  | { kind: 'otherNetwork'; network: HyperliquidNetwork }
  | { kind: 'invalid'; reason: string }

/**
 * Parse the page's query. `network` defaults to this build's. `name` and
 * `validUntil` from hl-tools are informational and ignored: extraAgents is
 * the source of truth.
 */
export const parseTreasuryRoute = (
  params: { get: (key: string) => string | null },
  buildNetwork: HyperliquidNetwork
): TreasuryRoute => {
  const rawNetwork = params.get('network')?.trim() || buildNetwork
  if (rawNetwork !== 'mainnet' && rawNetwork !== 'testnet') {
    return { kind: 'invalid', reason: `Unknown network "${rawNetwork}". Use testnet or mainnet.` }
  }
  const network: HyperliquidNetwork = rawNetwork
  if (network !== buildNetwork) return { kind: 'otherNetwork', network }

  const rawTreasury = params.get('treasury')?.trim()
  if (!rawTreasury) return { kind: 'pick', network }
  if (!isHexAddress(rawTreasury)) {
    return {
      kind: 'invalid',
      reason: 'The treasury address must be 0x followed by 40 hex characters.'
    }
  }
  const rawAgent = params.get('agent')?.trim()
  if (rawAgent && !isHexAddress(rawAgent)) {
    return {
      kind: 'invalid',
      reason: 'The agent address must be 0x followed by 40 hex characters.'
    }
  }
  return {
    kind: 'treasury',
    network,
    treasury: rawTreasury.toLowerCase() as Hex,
    agent: rawAgent ? (rawAgent.toLowerCase() as Hex) : null
  }
}

/** The same `/treasury?…` link on the sibling deployment, or `null` when it isn't configured. */
export const siblingTreasuryUrl = (siblingBaseUrl: string, search: string): string | null => {
  const href = buildNetworkSwitchUrl(siblingBaseUrl, '/treasury')
  if (!href) return null
  const url = new URL(href)
  url.search = search.startsWith('?') ? search.slice(1) : search
  return url.toString()
}
