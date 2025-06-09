import { useEffect, useState } from 'react'
import DepositModal from '../DepositWithdraw/DepositModal'
import { useHyperliquid } from '@/store/HyperliquidStore'
import ReactiveText from '../common/ReactiveText'

function OverviewBox() {
  const [isDepositOpen, setIsDepositOpen] = useState(false)
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
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(!isDepositOpen)} />
      <div className="w-full h-full">
        <div className="flex flex-col justify-center gap-3 p-2 w-full">
          <button onClick={() => setIsDepositOpen(true)} className="flex nexon-button">
            Deposit
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="w-full nexon-button nexon-primary"
            >
              Transfer
            </button>{' '}
            <button
              onClick={() => setIsDepositOpen(true)}
              className="w-full nexon-button nexon-primary"
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
