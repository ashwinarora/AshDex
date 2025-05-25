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
  const [isPostOnly, setIsPostOnly] = useState<boolean>(false)
  const [isReduceOnly, setIsReduceOnly] = useState<boolean>(false)
  const isSpot = useIsSpot()
  const [tpsl, setTpsl] = useState<TPSLType>({
    isTpsl: false,
    takeProfit: 0,
    stopLoss: 0
  })

  return (
    <div className="w-full h-full flex flex-col">
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-1">
          <div className="px-4 border-b border-[#FFFFFF0F] mb-1">
            <label className="block text-xs font-medium text-gray-300 mb-0.5">Limit price</label>
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
            <>
              <LeverageMargin
                selectedAsset={selectedAsset}
                leverage={leverage}
                setLeverage={setLeverage}
              />
              <MarginMode isCross={isCross} setIsCross={setIsCross} />
            </>
          )}
          <div className="grid grid-cols-1 gap-1 text-xs text-gray-400 border-b border-[#FFFFFF0F] pb-1 px-4">
            {!isSpot && (
              <>
                <CheckBox
                  label="Reduce Only"
                  setIsChecked={setIsReduceOnly}
                  isChecked={isReduceOnly}
                />
                <TPSL tpsl={tpsl} setTpsl={setTpsl} />
              </>
            )}
            <CheckBox label="Post-Only" setIsChecked={setIsPostOnly} isChecked={isPostOnly} />
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
