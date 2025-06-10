import { useEffect, useState } from 'react'
import DepositModal from '../DepositWithdraw/DepositModal'
import { useHyperliquid } from '@/store/HyperliquidStore'
import ReactiveText from '../common/ReactiveText'
import WithdrawModal from '../DepositWithdraw/WithdrawModal'
import TransferModal from './UserData/component/TransferModal'
import SendModal from './UserData/component/SendModal'
import { IconArrowsRightLeft } from '@tabler/icons-react'

function OverviewBox() {
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const { clearingHouseState } = useHyperliquid()
  const [totalUnrealizedPnl, setTotalUnrealizedPnl] = useState(0)

  const [maintenanceMargin, setMaintenanceMargin] = useState(0)
  const [totalCrossPositionsValue, setTotalCrossPositionsValue] = useState(0)
  const [crossAccountValue, setCrossAccountValue] = useState(0)
  const [crossMarginRatio, setCrossMarginRatio] = useState(0)

  useEffect(() => {
    const totalUnrealizedPnl =
      clearingHouseState?.assetPositions?.reduce(
        (acc, curr) => acc + curr.position.unrealizedPnl,
        0
      ) || 0
    setTotalUnrealizedPnl(totalUnrealizedPnl)
    setMaintenanceMargin(clearingHouseState?.crossMaintenanceMarginUsed || 0)
    setTotalCrossPositionsValue(
      clearingHouseState?.assetPositions?.reduce(
        (acc, curr) => acc + curr.position.positionValue,
        0
      ) || 0
    )
    setCrossAccountValue(clearingHouseState?.marginSummary?.accountValue || 0)
    setCrossMarginRatio((maintenanceMargin / crossAccountValue) * 100)
  }, [clearingHouseState])

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
      <div className="w-full h-full">
        <div className="flex flex-col justify-center gap-3 p-2 w-full">
          <div className="flex gap-3">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="w-full rounded-lg px-4 py-2 font-semibold transition-all duration-150 bg-primary text-white shadow hover:bg-primary-dark hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              Deposit
            </button>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="w-full rounded-lg px-4 py-2 font-semibold transition-all duration-150 bg-primary text-white shadow hover:bg-primary-dark hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              Withdraw
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="w-full rounded-lg px-4 py-2 font-semibold transition-all duration-150 bg-primary text-white shadow hover:bg-primary-dark hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              Perps <IconArrowsRightLeft stroke={2} className="inline mx-2" /> Spot
            </button>
            <button
              onClick={() => setIsSendModalOpen(true)}
              className="w-full rounded-lg px-4 py-2 font-semibold transition-all duration-150 bg-primary text-white shadow hover:bg-primary-dark hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              Send
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
                  <ReactiveText precision={2} type="currency" pulse={true} value={0} />
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
                  <p className="text-white text-sm">$100,000</p>
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
      </div>
    </>
  )
}

export default OverviewBox
