import type { Hex } from 'viem'

/** The extraAgents fields this module reads. `validUntil` is `null` when Hyperliquid reports none. */
export type ExtraAgent = { address: string; name: string; validUntil: number | null }

/**
 * Where this browser's treasury agent stands:
 * - `noKey`: no key stored for the treasury.
 * - `pending`: key stored but not (yet) approved: the co-signers have not
 *   carried out the approval.
 * - `ready`: approved and not expired; trading works. `validUntil` is `null`
 *   when Hyperliquid reports no expiry.
 * - `expired`: its validUntil has passed.
 * - `removed`: it was live before (validUntil cached) and is gone from
 *   extraAgents before expiring: removed, or replaced by another key.
 */
export type TreasuryAgentStatus =
  | { status: 'noKey' }
  | { status: 'pending' }
  | { status: 'ready'; validUntil: number | null; name: string }
  | { status: 'expired'; validUntil: number }
  | { status: 'removed' }

export const treasuryAgentStatus = ({
  keyAddress,
  cachedValidUntil,
  extraAgents,
  now
}: {
  /** Address of this browser's key for the treasury, if any. */
  keyAddress: Hex | null | undefined
  /** validUntil cached on the stored record once it was seen live. */
  cachedValidUntil: number | null | undefined
  extraAgents: readonly ExtraAgent[]
  now: number
}): TreasuryAgentStatus => {
  if (!keyAddress) return { status: 'noKey' }
  const listed = extraAgents.find((a) => a.address.toLowerCase() === keyAddress.toLowerCase())
  if (listed) {
    return listed.validUntil === null || listed.validUntil > now
      ? { status: 'ready', validUntil: listed.validUntil, name: listed.name }
      : { status: 'expired', validUntil: listed.validUntil }
  }
  if (cachedValidUntil == null) return { status: 'pending' }
  return cachedValidUntil > now
    ? { status: 'removed' }
    : { status: 'expired', validUntil: cachedValidUntil }
}
