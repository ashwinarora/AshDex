import type { TreasuryAgentStatus } from './agentStatus'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export type TreasuryBannerView = {
  /** `danger` means trading is stopped. */
  tone: 'normal' | 'warn' | 'danger'
  text: string
  /** Set when the banner should link to the treasury setup page. */
  action?: string
}

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`

/** "6 days", "5 hours", "12 minutes" (rounded down, at least 1 minute). */
export const formatTimeLeft = (ms: number): string => {
  if (ms >= DAY) return plural(Math.floor(ms / DAY), 'day')
  if (ms >= HOUR) return plural(Math.floor(ms / HOUR), 'hour')
  return plural(Math.max(1, Math.floor(ms / MINUTE)), 'minute')
}

/**
 * The treasury-mode banner, e.g. "Trading for 0x1464…233e (2 of 3) · your
 * API wallet expires in 6 days". Amber under a day left; red when trading is
 * stopped (expired, removed, not approved, no key).
 */
export const treasuryBannerView = ({
  status,
  treasuryLabel,
  signers,
  now
}: {
  /** `checking` while extraAgents hasn't loaded yet. */
  status: TreasuryAgentStatus | { status: 'checking' }
  /** Short treasury address, e.g. "0x1464…233e". */
  treasuryLabel: string
  /** Signer threshold, e.g. `{ threshold: 2, total: 3 }`, when known. */
  signers: { threshold: number; total: number } | null
  now: number
}): TreasuryBannerView => {
  const who = `Trading for ${treasuryLabel}${signers ? ` (${signers.threshold} of ${signers.total})` : ''}`
  switch (status.status) {
    case 'checking':
      return { tone: 'normal', text: `${who} · checking your API wallet…` }
    case 'ready': {
      if (status.validUntil === null) {
        return { tone: 'normal', text: `${who} · your API wallet has no set expiry` }
      }
      const left = status.validUntil - now
      return {
        tone: left < DAY ? 'warn' : 'normal',
        text: `${who} · your API wallet expires in ${formatTimeLeft(left)}`
      }
    }
    case 'expired':
      return {
        tone: 'danger',
        text: `${who} · Your API wallet is past its expiry: trading is stopped here. Hyperliquid may still accept it, so remove it in hl-tools or approve a new key.`,
        action: 'Remove or replace it'
      }
    case 'removed':
      return {
        tone: 'danger',
        text: `${who} · Removed: this API wallet was removed or replaced. Trading is stopped.`,
        action: 'Set up a new key'
      }
    case 'pending':
      return {
        tone: 'danger',
        text: `${who} · Waiting for the signers to approve your API wallet. Trading is stopped until then.`,
        action: 'Open treasury setup'
      }
    case 'noKey':
      return {
        tone: 'danger',
        text: `${who} · This browser has no API wallet for this treasury. Trading is stopped.`,
        action: 'Set up a key'
      }
  }
}
