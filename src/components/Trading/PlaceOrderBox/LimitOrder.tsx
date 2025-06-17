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
import { useHyperliquid } from '@/store/HyperliquidStore'
import { calculateLiquidationPrice } from '@/utils/utils'
import { getPerpsUniverseIndex } from '@/utils/utils'

const LimitOrder = ({ selectedAsset }: IPlaceOrderProps) => {
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [limitPrice, setLimitPrice] = useState<string>('')
  const [assetAmount, setAssetAmount] = useState<string>('')
  const [usdAmount, setUsdAmount] = useState<string>('')
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)
  const [isPostOnly, setIsPostOnly] = useState<boolean>(false)
  const [isReduceOnly, setIsReduceOnly] = useState<boolean>(false)
  const isSpot = useIsSpot()
  const [tpsl, setTpsl] = useState<TPSLType>({
    isTpsl: false,
    takeProfit: 0,
    stopLoss: 0
  })
  const { clearingHouseState, perpsMeta } = useHyperliquid()

  const [crossAccountValue, setCrossAccountValue] = useState(0)

  useEffect(() => {
    setCrossAccountValue(Number(clearingHouseState?.marginSummary.accountValue) || 0)
  }, [clearingHouseState])

  const liquidationPrice = () => {
    if (!limitPrice || !assetAmount || Number(limitPrice) === 0 || Number(assetAmount) === 0) {
      return 0
    }

    const assetIndex = getPerpsUniverseIndex(perpsMeta?.universe || [], selectedAsset)
    const maxLeverage = perpsMeta?.universe[assetIndex]?.maxLeverage || 1

    return calculateLiquidationPrice({
      entryPrice: Number(limitPrice),
      positionSize: Number(assetAmount),
      leverage,
      isBuy,
      usdAmount: Number(usdAmount),
      isCross,
      maxLeverage,
      crossAccountValue
    })
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
            <div className="flex flex-col gap-2 mx-3 text-xs">
              <CheckBox
                label="Reduce Only"
                setIsChecked={setIsReduceOnly}
                isChecked={isReduceOnly}
              />
              <CheckBox label="Post-Only" setIsChecked={setIsPostOnly} isChecked={isPostOnly} />
            </div>
          )}
          <hr className="border-white/10" />

          <div className="gap-2 grid grid-cols-1 px-3 pb-3 text-gray-400 text-xs">
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
          />
        </div>
        <div className="flex flex-col px-3 pb-2 text-sm">
          {!isSpot && (
            <>
              <div className="flex justify-between">
                <p className="text-white/50">Liquidation Price</p>
                <p className="text-white">{liquidationPrice()}</p>
              </div>

              <div className="flex justify-between">
                <p className="text-white/50">Margin Required</p>
                <p className="text-white">
                  ${((Number(assetAmount) * Number(limitPrice)) / leverage).toFixed(2)}
                </p>
              </div>
            </>
          )}
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
    </div>
  )
}
export default LimitOrder
