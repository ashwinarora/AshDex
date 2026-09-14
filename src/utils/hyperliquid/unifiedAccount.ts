import type {
  ClearinghouseStateResponse,
  SpotClearinghouseStateResponse
} from '@nktkas/hyperliquid'

export interface UnifiedUsdcAccount {
  /**
   * Total USDC-denominated equity backing the USDC validator perp DEX.
   * Includes spot USDC plus unrealized PnL on cross USDC positions.
   */
  accountValue: number
  /**
   * USDC that can be withdrawn without touching margin requirements.
   * `spot_total - isolatedMargin - crossMaintenanceMargin`, clamped to zero.
   */
  withdrawable: number
  /** Free USDC not committed to any perp margin bucket. */
  spotEquity: number
  /** USDC pledged as perp margin (isolated + cross maintenance). */
  perpEquity: number
  /** Cross maintenance margin used on the USDC validator DEX. */
  maintenanceMarginUsed: number
  /** Total isolated margin used across USDC-collateralized positions. */
  isolatedMarginUsed: number
  /** Raw USDC spot balance total from the spot clearinghouse state. */
  usdcSpotTotal: number
  /** Unrealized PnL summed over cross-margined USDC positions. */
  crossUnrealizedPnl: number
  /**
   * Cross maintenance margin ratio = crossMaintenanceMarginUsed / accountValue,
   * expressed as a fraction (multiply by 100 for percent). `0` when there is
   * no cross exposure or no equity to divide against.
   */
  crossMarginRatio: number
}

const toNumber = (v: string | undefined): number => {
  if (v == null) return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/**
 * Derive a USDC-collateralized trading account view under Hyperliquid's
 * unified-account (or portfolio-margin) abstraction. Under these modes the
 * spot USDC balance is the single collateral pool for the validator USDC perp
 * DEX, so per-DEX `marginSummary.accountValue` is no longer the source of
 * truth — spot balance minus committed margin is.
 *
 * Scope: USDC validator perps only. HIP-3 multi-collateral (USDT, HYPE, etc.)
 * and portfolio-margin borrows are intentionally out of scope for this pass.
 */
export function computeUnifiedUsdcAccount(
  spotState: SpotClearinghouseStateResponse | null,
  perpState: ClearinghouseStateResponse | null
): UnifiedUsdcAccount {
  const usdcBalance = spotState?.balances?.find(
    (b): b is Extract<typeof b, { coin: string }> => typeof b.coin === 'string' && b.coin === 'USDC'
  )
  const usdcSpotTotal = toNumber(usdcBalance?.total)

  let isolatedMarginUsed = 0
  let crossUnrealizedPnl = 0
  for (const ap of perpState?.assetPositions ?? []) {
    const pos = ap.position
    if (pos?.leverage?.type === 'isolated') {
      isolatedMarginUsed += toNumber(pos.marginUsed)
    } else {
      crossUnrealizedPnl += toNumber(pos.unrealizedPnl)
    }
  }

  const maintenanceMarginUsed = toNumber(perpState?.crossMaintenanceMarginUsed)

  const accountValue = usdcSpotTotal + crossUnrealizedPnl
  const withdrawable = Math.max(usdcSpotTotal - isolatedMarginUsed - maintenanceMarginUsed, 0)
  const spotEquity = Math.max(usdcSpotTotal - isolatedMarginUsed - maintenanceMarginUsed, 0)
  const perpEquity = isolatedMarginUsed + maintenanceMarginUsed + crossUnrealizedPnl
  const crossMarginRatio = accountValue > 0 ? maintenanceMarginUsed / accountValue : 0

  return {
    accountValue,
    withdrawable,
    spotEquity,
    perpEquity,
    maintenanceMarginUsed,
    isolatedMarginUsed,
    usdcSpotTotal,
    crossUnrealizedPnl,
    crossMarginRatio
  }
}
