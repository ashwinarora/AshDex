'use client'
import React, { useState } from 'react'
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

  return (
    <div className="flex flex-col w-full h-full">
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      <div className="flex-1 no-scrollbar">
        <div className="flex flex-col gap-2 ">
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
          <hr className=" border-white/10" />
          <div className="flex items-center px-3 mx-3 align-middle border rounded-md border-white/10">
            <p className="text-xs font-medium text-white/50 whitespace-nowrap">Limit price (USD)</p>
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
          <div className="mx-3 text-xs">
            <CheckBox label="Reduce Only" setIsChecked={setIsReduceOnly} isChecked={isReduceOnly} />
          </div>
          <hr className=" border-white/10" />

          <div className="grid grid-cols-1 gap-2 px-3 text-xs text-gray-400">
            {!isSpot && (
              <>
                <TPSL tpsl={tpsl} setTpsl={setTpsl} />
              </>
            )}
            {/* <CheckBox label="Post-Only" setIsChecked={setIsPostOnly} isChecked={isPostOnly} /> */}
          </div>
        </div>
      </div>
      <div className="p-2 border-t border-white/10">
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
    </div>
  )
}
export default LimitOrder
