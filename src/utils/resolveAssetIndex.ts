import { SPOT_DELTA } from '@/utils/constants'
import { isOutcomeCoin, parseOutcomeEncoding, toOutcomeAssetId } from '@/utils/outcomes/encoding'

/**
 * Resolve a coin name to the Hyperliquid asset index used by the exchange
 * cancel/order actions. Returns `null` when the coin is not present in the
 * universe.
 *
 * The previous inline implementation in `OpenOrders.tsx` gated on
 * `!assetIndex || assetIndex < 0`, which fires for `assetIndex === 0` — the
 * first asset in the perps universe (SOL on testnet at the time BUG-007 was
 * filed). Every SOL cancel therefore threw "Asset index not found" (BUG-007).
 * We now return `null` on miss so callers can differentiate "not found" from
 * "valid index 0".
 *
 * HIP-4 outcome shares (`#<enc>`) are self-describing — the encoding *is* the
 * asset id minus a fixed offset — so they resolve without any universe lookup,
 * regardless of the `isSpot` flag the caller happens to pass.
 */
export function resolveAssetIndex(
  coin: string,
  {
    isSpot,
    perpsUniverse,
    spotUniverse
  }: {
    isSpot: boolean
    perpsUniverse?: readonly { name: string }[]
    spotUniverse?: readonly { name: string; index: number }[]
  }
): number | null {
  if (isOutcomeCoin(coin)) {
    const enc = parseOutcomeEncoding(coin)
    return enc === null ? null : toOutcomeAssetId(enc)
  }
  if (isSpot) {
    const found = spotUniverse?.find((a) => a.name === coin)
    if (!found) return null
    const index = found.index
    if (typeof index !== 'number' || Number.isNaN(index)) return null
    return index + SPOT_DELTA
  }
  if (!perpsUniverse) return null
  const idx = perpsUniverse.findIndex((a) => a.name === coin)
  return idx < 0 ? null : idx
}
