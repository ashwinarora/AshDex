import React, { useState } from 'react'
import { IPlaceOrderProps } from '.'
import OrderButton from './components/OrderButton'
import LeverageMargin from './components/LeverageMargin'
import AmountInput from './components/AmountInput'
import BuyOrSell from './components/BuyOrSell'
import CheckBox from '@/components/common/CheckBox'
import MarginMode from './components/MarginMode'

const StopLimit = ({ selectedAsset }: IPlaceOrderProps) => {
  const [stopPrice, setStopPrice] = useState(0)
  const [limitPrice, setLimitPrice] = useState(0)
  const [isReduceOnly, setIsReduceOnly] = useState(false)
  const [isBuy, setIsBuy] = useState(true)
  const [amount, setAmount] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLimitPrice = parseFloat(e.target.value) || 0
    setLimitPrice(newLimitPrice)
    setTotal(newLimitPrice * amount)
  }

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
          <div className="border-b px-4 mb-1 border-[#FFFFFF0F]">
            <label className="block text-xs font-medium text-gray-300 mb-0.5">Limit Price</label>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="0.0000"
                value={limitPrice}
                onChange={handleLimitPriceChange}
                className="w-full rounded-md p-1.5 focus:outline-none focus:none focus:none text-sm font-medium"
              />
              <span className="text-white text-xs font-medium">USD</span>
            </div>
          </div>
          <AmountInput
            selectedAsset={selectedAsset}
            amount={amount}
            setAmount={setAmount}
            total={total}
            setTotal={setTotal}
            limitPrice={limitPrice}
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
          amount={amount}
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
