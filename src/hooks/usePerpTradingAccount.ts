import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useHyperliquidStore, useIsUnified } from '@/store/HyperliquidStore'
import { computeUnifiedUsdcAccount } from '@/utils/hyperliquid/unifiedAccount'

/**
 * Returns the USDC-collateralized trading account view used by perp order
 * forms and margin surfaces. Under standard/manual mode this pulls from
 * `clearinghouseState.marginSummary`; under unified/portfolio-margin it
 * derives the same numbers from spot state plus committed margin.
 */
export function usePerpTradingAccount() {
  const isUnified = useIsUnified()
  const { clearingHouseState, spotState } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState,
      spotState: state.spotState
    }))
  )

  return useMemo(() => {
    if (isUnified) {
      const unified = computeUnifiedUsdcAccount(spotState, clearingHouseState)
      return {
        isUnified: true as const,
        accountValue: unified.accountValue,
        withdrawable: unified.withdrawable,
        maintenanceMarginUsed: unified.maintenanceMarginUsed,
        crossMarginRatio: unified.crossMarginRatio,
        unified
      }
    }
    const accountValue = Number(clearingHouseState?.marginSummary?.accountValue) || 0
    const withdrawable = Number(clearingHouseState?.withdrawable) || 0
    const maintenanceMarginUsed = Number(clearingHouseState?.crossMaintenanceMarginUsed) || 0
    const crossMarginRatio = accountValue > 0 ? maintenanceMarginUsed / accountValue : 0
    return {
      isUnified: false as const,
      accountValue,
      withdrawable,
      maintenanceMarginUsed,
      crossMarginRatio,
      unified: null
    }
  }, [isUnified, clearingHouseState, spotState])
}
