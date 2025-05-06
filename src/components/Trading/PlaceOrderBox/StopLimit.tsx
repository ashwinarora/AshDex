import React, { useState } from 'react'
import { IPlaceOrderProps } from '.'
import OrderButton from './components/OrderButton'
import LeverageMargin from './components/LeverageMargin'
import AmountInput from './components/AmountInput'
import BuyOrSell from './components/BuyOrSell'
import CheckBox from '@/components/common/CheckBox'

const StopLimit = ({ selectedAsset }: IPlaceOrderProps) => {
  const [stopPrice, setStopPrice] = useState(0)
  const [limitPrice, setLimitPrice] = useState(0)
  const [isReduceOnly, setIsReduceOnly] = useState(false)
  const [isBuy, setIsBuy] = useState(true)
  const [assetAmount, setAssetAmount] = useState<number>(0)
  const [usdAmount, setUsdAmount] = useState<number>(0)
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLimitPrice = parseFloat(e.target.value) || 0
    setLimitPrice(newLimitPrice)
    setUsdAmount(newLimitPrice * assetAmount)
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="border-b border-white/10">
        <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          <div className="border-b px-4 mb-2 border-[#FFFFFF0F]">
            <label className="block mb-1 text-sm font-medium text-[#8B8BA0]">Stop Price:</label>
            <input
              type="text"
              value={stopPrice}
              onChange={(e) => setStopPrice(parseFloat(e.target.value) || 0)}
              className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
            />
          </div>
          <div className="border-b px-4 mb-2 border-[#FFFFFF0F]">
            <label className="block mb-1 text-sm font-medium text-[#8B8BA0]">Limit Price:</label>
            <div className="flex items-center ">
              <input
                type="text"
                placeholder="0.0000"
                value={limitPrice}
                onChange={handleLimitPriceChange}
                className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
              />
              <span className=" text-white text-sm font-medium">USD</span>
            </div>
          </div>
          <AmountInput
            selectedAsset={selectedAsset}
            assetAmount={assetAmount}
            setAssetAmount={setAssetAmount}
            usdAmount={usdAmount}
            setUsdAmount={setUsdAmount}
            limitPrice={limitPrice}
            isReduceOnly={isReduceOnly}
            isBuy={isBuy}
          />
          <div className="px-4 pb-2">
            <CheckBox label="Reduce Only" setIsChecked={setIsReduceOnly} isChecked={isReduceOnly} />
          </div>
          <LeverageMargin
            selectedAsset={selectedAsset}
            isCross={isCross}
            leverage={leverage}
            setLeverage={setLeverage}
            setIsCross={setIsCross}
          />
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
          limitPrice={limitPrice}
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
export default StopLimit
