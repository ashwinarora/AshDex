import { useEffect, useState } from 'react'
import DepositModal from '../DepositWithdraw/DepositModal'
import { useHyperliquid } from '@/store/HyperliquidStore'
import ReactiveText from '../common/ReactiveText'
import WithdrawModal from '../DepositWithdraw/WithdrawModal'
import TransferModal from './UserData/component/TransferModal'
import SendModal from './UserData/component/SendModal'
import { IconTransfer } from '@tabler/icons-react'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

function OverviewBox() {
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const { clearingHouseState, spotState, spotAssetContext } = useHyperliquid()
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
    <>
      {isDepositOpen && (
        <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(!isDepositOpen)} />
      )}
      {isWithdrawOpen && (
        <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(!isWithdrawOpen)} />
      )}
      {isTransferModalOpen && (
        <TransferModal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} />
      )}
      {isSendModalOpen && (
        <SendModal isOpen={isSendModalOpen} onClose={() => setIsSendModalOpen(false)} />
      )}
      <div className="w-full h-full flex flex-col gap-2 p-2">
        <div className="flex items-center justify-center gap-2 w-full">
          <Button onClick={() => setIsSendModalOpen(true)} variant="outline" className="flex-2">
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
          <Button onClick={() => setIsWithdrawOpen(true)} variant="outline" className="flex-2">
            Withdraw
          </Button>
        </div>
        <Button onClick={() => setIsDepositOpen(true)}>Deposit</Button>
        <Separator className="w-full" />
        <div className="flex flex-col gap-2">
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
      </div>
      {/* <div className="w-full h-full">
        <div className="flex flex-col justify-center gap-3 p-2 w-full">
          <div className="flex gap-3">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="bg-primary hover:bg-primary-dark shadow hover:shadow-lg px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-full text-white hover:scale-[1.02] transition-all duration-150 cursor-pointer"
            >
              Deposit
            </button>{' '}
            <button
              onClick={() => setIsSendModalOpen(true)}
              className="bg-primary hover:bg-primary-dark shadow hover:shadow-lg px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-full text-white hover:scale-[1.02] transition-all duration-150 cursor-pointer"
            >
              Send
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="bg-transparent hover:bg-primary-dark shadow hover:shadow-lg px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-full text-white hover:scale-[1.02] transition-all duration-150 cursor-pointer"
            >
              Perps <IconTransfer className="inline mx-2 w-4 h-4" /> Spot
            </button>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="bg-transparent hover:bg-primary-dark shadow hover:shadow-lg px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-full text-white hover:scale-[1.02] transition-all duration-150 cursor-pointer"
            >
              Withdraw
            </button>
          </div>
        </div>
        <hr className="border-white/10" />
        <div className="flex flex-col gap-2 p-3">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-2 w-full">
              <p className="text-white text-sm">Account Equity</p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center gap-2 w-full">
                  <p className="text-white/50 text-sm">Spot</p>
                  <ReactiveText
                    precision={2}
                    type="currency"
                    pulse={true}
                    value={spotAccountValue || 0}
                  />
                </div>
                <div className="flex justify-between items-center gap-2 w-full">
                  <p className="text-white/50 text-sm">Perps</p>
                  <ReactiveText
                    precision={2}
                    type="currency"
                    pulse={true}
                    value={crossAccountValue || 0}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-2 w-full">
              <p className="text-white text-sm">Perps Overview</p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center gap-2 w-full">
                  <p className="text-white/50 text-sm">Balance</p>

                  <ReactiveText
                    precision={2}
                    type="currency"
                    value={crossAccountValue - totalUnrealizedPnl}
                  />
                </div>
                <div className="flex justify-between items-center gap-2 w-full">
                  <p className="text-white/50 text-sm">Unrealized PnL</p>
                  <ReactiveText
                    precision={2}
                    type="currency"
                    isStatic={true}
                    value={totalUnrealizedPnl}
                  />
                </div>
                <div className="flex justify-between items-center gap-2 w-full">
                  <p className="text-white/50 text-sm">Cross Margin Ratio</p>
                  <ReactiveText precision={2} type="percentage" value={crossMarginRatio} />
                </div>
                <div className="flex justify-between items-center gap-2 w-full">
                  <p className="text-white/50 text-sm">Maintenance Margin</p>
                  <ReactiveText precision={2} type="currency" value={maintenanceMargin} />
                </div>
                <div className="flex justify-between items-center gap-2 w-full">
                  <p className="text-white/50 text-sm">Cross Account Leverage</p>
                  <ReactiveText
                    precision={2}
                    type="leverage"
                    value={totalCrossPositionsValue / crossAccountValue}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </>
  )
}

export default OverviewBox
