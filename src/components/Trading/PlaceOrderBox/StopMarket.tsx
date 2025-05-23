import React, { useState } from 'react'
import { IPlaceOrderProps } from '.'
import OrderButton from './components/OrderButton'
import LeverageMargin from './components/LeverageMargin'
import AmountInput from './components/AmountInput'
import BuyOrSell from './components/BuyOrSell'
import CheckBox from '@/components/common/CheckBox'
import MarginMode from './components/MarginMode'
import { useHyperliquid } from '@/store/HyperliquidStore'

const StopMarket = ({ selectedAsset }: IPlaceOrderProps) => {
  const { allMids } = useHyperliquid()
  const [stopPrice, setStopPrice] = useState(0)
  const [isReduceOnly, setIsReduceOnly] = useState(false)
  const [isBuy, setIsBuy] = useState(true)
  const [assetAmount, setAssetAmount] = useState<string>('')
  const [usdAmount, setUsdAmount] = useState<string>('')
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)

  return (
    <div className="w-full h-full flex flex-col">
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          <div className="border-b px-4 mb-1 border-[#FFFFFF0F]">
            <label className="block text-xs font-medium text-gray-300 mb-0.5">Stop Price</label>
            <input
              type="text"
              value={stopPrice}
              onChange={(e) => setStopPrice(parseFloat(e.target.value) || 0)}
              className="w-full rounded-md p-1.5 focus:outline-none focus:none focus:none text-sm font-medium"
            />
          </div>
          <AmountInput
            selectedAsset={selectedAsset}
            assetAmount={assetAmount}
            setAssetAmount={setAssetAmount}
            usdAmount={usdAmount}
            setUsdAmount={setUsdAmount}
            limitPrice={allMids[selectedAsset].toString()}
            leverage={leverage}
            isReduceOnly={isReduceOnly}
            isBuy={isBuy}
          />
          <LeverageMargin
            selectedAsset={selectedAsset}
            leverage={leverage}
            setLeverage={setLeverage}
          />
          <MarginMode isCross={isCross} setIsCross={setIsCross} />

          <div className="px-4 pb-1 text-xs text-gray-400">
            <CheckBox label="Reduce Only" setIsChecked={setIsReduceOnly} isChecked={isReduceOnly} />
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-white/10">
        <OrderButton
          selectedAsset={selectedAsset}
          isBuy={isBuy}
          isCross={isCross}
          isPostOnly={false}
          isReduceOnly={isReduceOnly}
          leverage={leverage}
          assetAmount={assetAmount}
          limitPrice={(allMids[selectedAsset] * (isBuy ? 1.1 : 0.9)).toString()}
          stopOrder={{
            isMarket: false,
            tpsl: 'sl',
            triggerPx: stopPrice
          }}
        />
      </div>
    </div>
  )
}
export default StopMarket
