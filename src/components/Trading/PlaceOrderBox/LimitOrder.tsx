'use client'
import { useState, useEffect } from 'react'
import BuyOrSell from './components/BuyOrSell'
import AmountInput from './components/AmountInput'
import LeverageMargin from './components/LeverageMargin'
import OrderButton from './components/OrderButton'
import CheckBox from '@/components/common/CheckBox'
import TPSL, { TPSLType } from './components/TPSL'
import { IPlaceOrderProps } from '.'
import useIsSpot from '@/hooks/useIsSpot'
import AmountInputSpot from './components/AmountInputSpot'
import MarginMode from './components/MarginMode'
import SetPrice from './components/SetPrice'

const LimitOrder = ({ selectedAsset }: IPlaceOrderProps) => {
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [limitPrice, setLimitPrice] = useState<string>('')
  const [assetAmount, setAssetAmount] = useState<string>('')
  const [usdAmount, setUsdAmount] = useState<string>('')
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)
  const isPostOnly = false
  const [isReduceOnly, setIsReduceOnly] = useState<boolean>(false)
  const isSpot = useIsSpot()
  const [tpsl, setTpsl] = useState<TPSLType>({
    isTpsl: false,
    takeProfit: 0,
    stopLoss: 0
  })
  const [isInvalid, setIsInvalid] = useState<boolean>(false)

  useEffect(() => {
    if (isSpot) {
      return
    }
    const formattedLimitPrice = limitPrice.replace(/\.?0+$/, '')
    const formattedAssetAmount = assetAmount.replace(/\.?0+$/, '')

    // Check if TPSL is enabled and both values are empty/zero
    const isTpslInvalid =
      tpsl.isTpsl && Number(tpsl.takeProfit) === 0 && Number(tpsl.stopLoss) === 0

    if (
      formattedLimitPrice === '0' ||
      formattedLimitPrice === '' ||
      formattedAssetAmount === '0' ||
      formattedAssetAmount === '' ||
      isTpslInvalid ||
      Number(usdAmount) < 10
    ) {
      setIsInvalid(true)
    } else {
      setIsInvalid(false)
    }
  }, [limitPrice, assetAmount, tpsl])

  const calculateLiquidationPrice = () => {
    if (!limitPrice || !assetAmount || Number(limitPrice) === 0 || Number(assetAmount) === 0) {
      return 0
    }

    const entryPrice = Number(limitPrice)
    const positionSize = Number(assetAmount)
    const leverageUsed = leverage
    const orderValue = entryPrice * positionSize

    // Initial margin required
    const initialMargin = orderValue / leverageUsed

    // Maintenance margin is half of initial margin
    const maintenanceMargin = initialMargin / 2

    // Margin available = Account value - maintenance margin (assuming full balance used)
    const accountValue = initialMargin // Cross margin assumption: full margin used
    const marginAvailable = accountValue - maintenanceMargin

    const side = isBuy ? 1 : -1
    const l = 1 / 40 // MAINTENANCE_LEVERAGE is 40 for 40x max leverage asset

    const denom = positionSize * (1 - l * side)

    if (denom === 0) return 0

    const liqPrice = entryPrice - side * (marginAvailable / denom)
    if (Number(usdAmount) < 10) {
      return 'N/A'
    }
    return Number(liqPrice).toFixed(2)
  }

  return (
    <div className="flex flex-col w-full h-full">
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      <div className="flex-1 no-scrollbar">
        <div className="flex flex-col gap-2">
          {!isSpot && (
            <>
              <MarginMode isCross={isCross} setIsCross={setIsCross} />
              <LeverageMargin
                selectedAsset={selectedAsset}
                leverage={leverage}
                setLeverage={setLeverage}
              />
            </>
          )}
          <hr className="border-white/10" />
          <div className="flex items-center mx-3 px-3 border border-white/10 rounded-md align-middle">
            <p className="font-medium text-white/50 text-xs whitespace-nowrap">Limit price (USD)</p>
            <SetPrice
              selectedAsset={selectedAsset}
              limitPrice={limitPrice}
              setLimitPrice={setLimitPrice}
              setUsdAmount={setUsdAmount}
              assetAmount={assetAmount}
            />
          </div>
          {isSpot ? (
            <AmountInputSpot
              selectedAsset={selectedAsset}
              assetAmount={assetAmount}
              setAssetAmount={setAssetAmount}
              usdAmount={usdAmount}
              setUsdAmount={setUsdAmount}
              limitPrice={limitPrice}
              isBuy={isBuy}
            />
          ) : (
            <AmountInput
              selectedAsset={selectedAsset}
              assetAmount={assetAmount}
              setAssetAmount={setAssetAmount}
              usdAmount={usdAmount}
              setUsdAmount={setUsdAmount}
              limitPrice={limitPrice}
              leverage={leverage}
              isReduceOnly={isReduceOnly}
              isBuy={isBuy}
            />
          )}
          {!isSpot && (
            <div className="mx-3 text-xs">
              <CheckBox
                label="Reduce Only"
                setIsChecked={setIsReduceOnly}
                isChecked={isReduceOnly}
              />
            </div>
          )}
          <hr className="border-white/10" />

          <div className="gap-2 grid grid-cols-1 px-3 text-gray-400 text-xs">
            {!isSpot && (
              <>
                <TPSL
                  limitPrice={limitPrice}
                  isBuy={isBuy}
                  leverage={leverage}
                  tpsl={tpsl}
                  setTpsl={setTpsl}
                />
              </>
            )}
            {/* <CheckBox label="Post-Only" setIsChecked={setIsPostOnly} isChecked={isPostOnly} /> */}
          </div>
        </div>
      </div>
      <div className="p-2 border-white/10 border-t">
        <OrderButton
          isBuy={isBuy}
          selectedAsset={selectedAsset}
          limitPrice={limitPrice}
          assetAmount={assetAmount}
          leverage={leverage}
          isCross={isCross}
          isPostOnly={isPostOnly}
          isReduceOnly={isReduceOnly}
          tpsl={tpsl}
          isInvalid={isInvalid}
        />
      </div>
      <div className="flex flex-col p-3 text-sm">
        <div className="flex justify-between">
          <p className="text-white/50">Liquidation Price</p>
          <p className="text-white"> {calculateLiquidationPrice()}</p>
        </div>

        <div className="flex justify-between">
          <p className="text-white/50">Order Value</p>
          <p className="text-white">${Number(usdAmount).toFixed(2)} </p>
        </div>
        <div className="flex justify-between">
          <p className="text-white/50">Fees</p>
          <p className="text-white">0.0% / 0.0%</p>
        </div>
      </div>
    </div>
  )
}
export default LimitOrder
