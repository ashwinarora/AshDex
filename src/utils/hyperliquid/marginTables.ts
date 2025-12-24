/**
 * Hyperliquid "perps meta" includes:
 * - `universe`: per-asset config (coin name, szDecimals, maxLeverage, marginTableId, etc)
 * - `marginTables`: definitions for tiered leverage limits keyed by `marginTableId`
 *
 * The API / SDK can represent `marginTables` in (at least) two shapes:
 * - A list of tuples: `Array<[marginTableId, { description, marginTiers }]>` (common in JSON payloads)
 * - A sparse array / indexable object where `marginTables[marginTableId]` returns that tuple.
 *
 * The tier rule is:
 * - Pick the tier with the greatest `lowerBound` such that `positionNotionalUsd >= lowerBound`.
 * - Return that tier's `maxLeverage`.
 */

import { type WebData2Event } from '@nktkas/hyperliquid/api/subscription'

type HyperliquidMarginTables = WebData2Event['meta']['marginTables']

type HyperliquidMarginTableEntry = HyperliquidMarginTables[number]

function isMarginTableEntry(value: unknown): value is HyperliquidMarginTableEntry {
  if (!Array.isArray(value) || value.length !== 2) return false
  const [id, table] = value as [unknown, unknown]
  return (
    typeof id === 'number' &&
    !!table &&
    typeof table === 'object' &&
    'marginTiers' in table &&
    Array.isArray((table as { marginTiers?: unknown }).marginTiers)
  )
}

function findMarginTableEntryById(
  marginTables: HyperliquidMarginTables | null | undefined,
  marginTableId: number
): HyperliquidMarginTableEntry | null {
  if (!marginTables || !Number.isFinite(marginTableId)) return null

  // Fast path: sparse array / indexable object where key === id.
  const direct = (marginTables as Record<number, unknown>)[marginTableId]
  if (isMarginTableEntry(direct) && direct[0] === marginTableId) return direct

  // Fallback: scan list of tuples to find the one with matching id.
  if (Array.isArray(marginTables)) {
    for (const entry of marginTables) {
      if (isMarginTableEntry(entry) && entry[0] === marginTableId) return entry
    }
  } else {
    for (const key of Object.keys(marginTables)) {
      const entry = (marginTables as Record<string, unknown>)[key]
      if (isMarginTableEntry(entry) && entry[0] === marginTableId) return entry
    }
  }

  return null
}

function collectLeverageTiers(
  entry: HyperliquidMarginTableEntry
): Array<{ lowerBoundUsd: number; maxLeverage: number }> {
  const tiers = entry[1].marginTiers
  const out: Array<{ lowerBoundUsd: number; maxLeverage: number }> = []

  for (const t of tiers) {
    const lowerBoundUsd = Number(t.lowerBound)
    const maxLeverage = Number(t.maxLeverage)
    if (!Number.isFinite(lowerBoundUsd) || lowerBoundUsd < 0) continue
    if (!Number.isFinite(maxLeverage) || maxLeverage <= 0) continue
    out.push({ lowerBoundUsd, maxLeverage })
  }

  out.sort((a, b) => a.lowerBoundUsd - b.lowerBoundUsd)
  return out
}

function selectMaxLeverageForNotional(
  tiers: Array<{ lowerBoundUsd: number; maxLeverage: number }>,
  positionNotionalUsd: number
): number | null {
  if (!Number.isFinite(positionNotionalUsd) || positionNotionalUsd < 0) return null
  if (tiers.length === 0) return null

  let selected = tiers[0].maxLeverage
  for (const tier of tiers) {
    if (positionNotionalUsd >= tier.lowerBoundUsd) selected = tier.maxLeverage
    else break
  }

  const lev = Math.floor(selected)
  return Number.isFinite(lev) && lev > 0 ? lev : null
}

/**
 * Returns the max allowed leverage for a given `marginTableId` and position size (notional) in USD.
 *
 * - `positionNotionalUsd` is compared against each tier's `lowerBound` (also USD).
 * - Returns `null` when the table/tier cannot be determined.
 */
function getMaxLeverageForMarginTableIdAndPositionSize({
  marginTables,
  marginTableId,
  positionNotionalUsd
}: {
  marginTables: HyperliquidMarginTables | null | undefined
  marginTableId: number
  positionNotionalUsd: number
}): number | null {
  const entry = findMarginTableEntryById(marginTables, marginTableId)
  if (!entry) return null

  const tiers = collectLeverageTiers(entry)
  return selectMaxLeverageForNotional(tiers, positionNotionalUsd)
}

// Pure helper: compute the max allowed leverage for a given asset/notional from margin tables
export function getMaxAllowedLeverageForNotional({
  perpsMeta,
  assetUniverse,
  notional
}: {
  perpsMeta: WebData2Event['meta']
  assetUniverse: WebData2Event['meta']['universe'][number]
  notional: number
}): number | null {
  try {
    const marginTableId = assetUniverse.marginTableId
    if (marginTableId === undefined) return null
    return getMaxLeverageForMarginTableIdAndPositionSize({
      marginTables: perpsMeta.marginTables,
      marginTableId,
      positionNotionalUsd: notional
    })
  } catch {
    return null
  }
}
