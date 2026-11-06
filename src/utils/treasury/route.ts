import type { Hex } from 'viem'
import type { HyperliquidNetwork } from '@/utils/tradingAccount'

/** In-app link to the treasury setup page (`/treasury?network=…&treasury=…`). */
export const treasuryPageHref = (network: HyperliquidNetwork, treasury?: Hex): string => {
  const params = new URLSearchParams({ network })
  if (treasury) params.set('treasury', treasury)
  return `/treasury?${params.toString()}`
}
