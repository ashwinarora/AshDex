import { useEffect, useState } from 'react'
import DepositModal from '../DepositWithdraw/DepositModal'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import ReactiveText from '../common/ReactiveText'
import TransferModal from './UserData/component/TransferModal'
import SendModal from './UserData/component/SendModal'
import { IconTransfer } from '@tabler/icons-react'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { useShallow } from 'zustand/react/shallow'

function OverviewBox() {
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

    const spotTokens = spotState?.balances
    const spotUSDCBalance = spotTokens?.find((token) => token.coin === 'USDC')?.total || 0

    const spotTokenPrices =
      spotTokens?.slice(1).map((token) => {
        const spotUniverse = spotMeta?.universe.find(
          (a: { tokens: number[]; index: number }) => a.tokens[0] === token.token
        )
        const price = spotAssetContext[spotUniverse?.index || 0]?.markPx || 0
        return Number(token.total) * Number(price)
      }) || []

    const totalSpotValue = spotTokenPrices.reduce((acc, curr) => acc + curr, 0)
    setSpotAccountValue(totalSpotValue + Number(spotUSDCBalance))
  }, [clearingHouseState, spotState, spotMeta, spotAssetContext])

  return (
    <div className="w-full h-full flex-1 flex flex-col gap-2 p-2 bg-secondary rounded-md">
      <div className="flex items-center justify-center gap-2 w-full">
        <Button onClick={() => setIsSendModalOpen(true)} variant="outline" className="flex-1">
          Send
        </Button>
        <Button
          onClick={() => setIsTransferModalOpen(true)}
          variant="outline"
          className="flex flex-1 items-center justify-center gap-2"
        >
          <p>Perps</p>
          <IconTransfer className="size-3" />
          <p>Spot</p>
        </Button>
      </div>
      <Button onClick={() => setIsDepositOpen(true)}>Deposit</Button>
      <Separator className="w-full" />
      <div className="flex flex-col gap-2 flex-1 h-full">
        <div className="flex justify-between items-center gap-2 w-full">
          <p className="text-white text-sm">Account Equity</p>
        </div>
        <div className="flex justify-between items-center gap-2 w-full">
          <p className="text-white/50 text-xs">Spot</p>
          <ReactiveText
            precision={2}
            type="currency"
            className="text-xs"
            pulse={true}
            value={spotAccountValue || 0}
          />
        </div>
        <div className="flex justify-between items-center gap-2 w-full">
          <p className="text-white/50 text-xs">Perps</p>
          <ReactiveText
            precision={2}
            type="currency"
            className="text-xs"
            pulse={true}
            value={crossAccountValue || 0}
          />
        </div>
        <Separator className="w-full" />
        <div className="flex justify-between items-center gap-2 w-full">
          <p className="text-white text-sm">Perps Overview</p>
        </div>
        <div className="flex justify-between items-center gap-2 w-full">
          <p className="text-white/50 text-xs">Balance</p>
          <ReactiveText
            precision={2}
            type="currency"
            className="text-xs"
            value={crossAccountValue - totalUnrealizedPnl}
          />
        </div>
        <div className="flex justify-between items-center gap-2 w-full">
          <p className="text-white/50 text-xs">Unrealized PnL</p>
          <ReactiveText
            precision={2}
            type="currency"
            isStatic={true}
            className="text-xs"
            value={totalUnrealizedPnl}
          />
        </div>
        <div className="flex justify-between items-center gap-2 w-full">
          <p className="text-white/50 text-xs">Cross Margin Ratio</p>
          <ReactiveText
            precision={2}
            type="percentage"
            value={crossMarginRatio}
            className="text-xs"
          />
        </div>
        <div className="flex justify-between items-center gap-2 w-full">
          <p className="text-white/50 text-xs">Maintenance Margin</p>
          <ReactiveText
            precision={2}
            type="currency"
            value={maintenanceMargin}
            className="text-xs"
          />
        </div>
        <div className="flex justify-between items-center gap-2 w-full">
          <p className="text-white/50 text-xs">Cross Account Leverage</p>
          <ReactiveText
            precision={2}
            type="leverage"
            className="text-xs"
            value={totalCrossPositionsValue / crossAccountValue}
          />
        </div>
      </div>
      {isDepositOpen && (
        <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(!isDepositOpen)} />
      )}
      {isTransferModalOpen && (
        <TransferModal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} />
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
