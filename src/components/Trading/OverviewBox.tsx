import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import DepositModal from '../DepositWithdraw/DepositModal'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import ReactiveText from '../reactive-text'
import SpotToPerpTransferModal from '../UserData/component/transfers/spot-to-perp'
import SendModal from '../UserData/component/SendModal'
import { IconTransfer } from '@tabler/icons-react'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/lib/utils'
function OverviewBox({ isRTL }: { isRTL: boolean }) {
  const { isConnected } = useConnection()
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const { clearingHouseState, spotState, spotAssetContext } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState,
      spotState: state.spotState,
      spotAssetContext: state.spotAssetContext
    }))
  )
  const [totalUnrealizedPnl, setTotalUnrealizedPnl] = useState(0)

  const [maintenanceMargin, setMaintenanceMargin] = useState(0)
  const [totalCrossPositionsValue, setTotalCrossPositionsValue] = useState(0)
  const [crossAccountValue, setCrossAccountValue] = useState(0)
  const [crossMarginRatio, setCrossMarginRatio] = useState(0)

  const [spotAccountValue, setSpotAccountValue] = useState(0)
  const { data: spotMeta } = useSpotMeta()
  useEffect(() => {
    const totalUnrealizedPnl =
      clearingHouseState?.assetPositions?.reduce(
        (acc, curr) => acc + Number(curr.position.unrealizedPnl),
        0
      ) || 0
    setTotalUnrealizedPnl(totalUnrealizedPnl)
    setMaintenanceMargin(Number(clearingHouseState?.crossMaintenanceMarginUsed) || 0)
    setTotalCrossPositionsValue(
      clearingHouseState?.assetPositions?.reduce(
        (acc, curr) => acc + Number(curr.position.positionValue),
        0
      ) || 0
    )
    setCrossAccountValue(Number(clearingHouseState?.marginSummary?.accountValue) || 0)
    setCrossMarginRatio((maintenanceMargin / crossAccountValue) * 100)

    const spotTokens = spotState?.balances ?? []
    const spotUSDCBalance = Number(spotTokens.find((token) => token.coin === 'USDC')?.total ?? 0)

    // Filter by coin rather than `.slice(1)` — the old code assumed USDC was
    // always at index 0 in the balances array. Also guard the universe lookup
    // so a missing spot universe entry prices to 0 instead of accidentally
    // reading `spotAssetContext[0]`.
    const spotTokenPrices = spotTokens
      .filter(
        (token): token is typeof token & { token: number } =>
          'token' in token && token.coin !== 'USDC'
      )
      .map((token) => {
        const spotUniverse = spotMeta?.universe.find(
          (a: { tokens: number[]; index: number }) => a.tokens[0] === token.token
        )
        const idx = spotUniverse?.index ?? -1
        const price = Number(spotAssetContext[idx]?.markPx ?? 0)
        return Number(token.total) * (Number.isFinite(price) ? price : 0)
      })

    const totalSpotValue = spotTokenPrices.reduce((acc, curr) => acc + curr, 0)
    setSpotAccountValue(totalSpotValue + spotUSDCBalance)
  }, [clearingHouseState, spotState, spotMeta, spotAssetContext])

  return (
    <div className="w-full h-full flex-1 flex flex-col gap-2 p-2 bg-secondary rounded-md">
      <div
        className={cn(
          'flex items-center justify-center gap-2 w-full',
          isRTL ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {/*
          R1-B2: gate the action buttons on wallet-connected state. After a
          Rabby disconnect the sidebar previously stayed clickable and
          rendered stale balances until the user refreshed. Now the buttons
          are disabled and the equity numbers below fall back to 0.00 (see
          the isConnected guard in the render values).

          R1-UX3: rename the "Perps [icon] Spot" tri-cell into a plain
          "Transfer" button so screen readers announce a single word and the
          intent is obvious. The dialog title still names both sides.
        */}
        <Button
          onClick={() => setIsSendModalOpen(true)}
          variant="outline"
          className="flex-1"
          disabled={!isConnected}
        >
          {'Send'}
        </Button>
        <Button
          onClick={() => setIsTransferModalOpen(true)}
          variant="outline"
          className="flex flex-1 items-center justify-center gap-2"
          disabled={!isConnected}
          data-testid="overview-transfer"
        >
          <IconTransfer className="size-3" />
          <p>{'Transfer'}</p>
        </Button>
      </div>
      <Button onClick={() => setIsDepositOpen(true)} disabled={!isConnected}>
        {'Deposit'}
      </Button>
      <Separator className="w-full" />
      <div className="flex flex-col gap-2 flex-1 h-full">
        <div
          className={cn(
            'flex justify-between items-center gap-2 w-full',
            isRTL && 'flex-row-reverse'
          )}
        >
          <p className="text-white text-sm">{'Account Equity'}</p>
        </div>
        <div
          className={cn(
            'flex justify-between items-center gap-2 w-full',
            isRTL && 'flex-row-reverse'
          )}
        >
          <p className="text-white/70 text-xs">{'Spot'}</p>
          <ReactiveText
            precision={2}
            type="currency"
            className="text-xs"
            pulse={true}
            value={isConnected ? spotAccountValue || 0 : 0}
          />
        </div>
        <div
          className={cn(
            'flex justify-between items-center gap-2 w-full',
            isRTL && 'flex-row-reverse'
          )}
        >
          <p className="text-white/70 text-xs">{'Perps'}</p>
          <ReactiveText
            precision={2}
            type="currency"
            className="text-xs"
            pulse={true}
            value={isConnected ? crossAccountValue || 0 : 0}
          />
        </div>
        <Separator className="w-full" />
        <div
          className={cn(
            'flex justify-between items-center gap-2 w-full',
            isRTL && 'flex-row-reverse'
          )}
        >
          <p className="text-white text-sm">{'Perps Overview'}</p>
        </div>
        <div
          className={cn(
            'flex justify-between items-center gap-2 w-full',
            isRTL && 'flex-row-reverse'
          )}
        >
          <p className="text-white/70 text-xs">{'Balance'}</p>
          <ReactiveText
            precision={2}
            type="currency"
            className="text-xs"
            value={isConnected ? crossAccountValue - totalUnrealizedPnl : 0}
          />
        </div>
        <div
          className={cn(
            'flex justify-between items-center gap-2 w-full',
            isRTL && 'flex-row-reverse'
          )}
        >
          <p className="text-white/70 text-xs">{'Unrealized PnL'}</p>
          <ReactiveText
            precision={2}
            type="currency"
            isStatic={true}
            className="text-xs"
            value={isConnected ? totalUnrealizedPnl : 0}
          />
        </div>
        <div
          className={cn(
            'flex justify-between items-center gap-2 w-full',
            isRTL && 'flex-row-reverse'
          )}
        >
          <p className="text-white/70 text-xs">{'Cross Margin Ratio'}</p>
          <ReactiveText
            precision={2}
            type="percentage"
            value={isConnected ? crossMarginRatio : 0}
            className="text-xs"
          />
        </div>
        <div
          className={cn(
            'flex justify-between items-center gap-2 w-full',
            isRTL && 'flex-row-reverse'
          )}
        >
          <p className="text-white/70 text-xs">{'Maintenance Margin'}</p>
          <ReactiveText
            precision={2}
            type="currency"
            value={isConnected ? maintenanceMargin : 0}
            className="text-xs"
          />
        </div>
        <div
          className={cn(
            'flex justify-between items-center gap-2 w-full',
            isRTL && 'flex-row-reverse'
          )}
        >
          <p className="text-white/70 text-xs">{'Cross Account Leverage'}</p>
          <ReactiveText
            precision={2}
            type="leverage"
            className="text-xs"
            value={isConnected ? totalCrossPositionsValue / crossAccountValue : 0}
          />
        </div>
      </div>
      {isDepositOpen && (
        <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(!isDepositOpen)} />
      )}
      {isTransferModalOpen && (
        <SpotToPerpTransferModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          // BUG-037: on a trading page the primary intent is to move funds
          // INTO perps so users can trade. Default the direction accordingly
          // instead of the previous perps → spot default.
          defaultToPerp={true}
        />
      )}
      {isSendModalOpen && (
        <SendModal
          isTriggeredByCustomButton={true}
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
        />
      )}
    </div>
  )
}

export default OverviewBox
