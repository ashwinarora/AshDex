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
    <div className="p-4 bg-gray-800 text-white rounded-md shadow-md">
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Stop Price:</label>
        <input
          type="number"
          value={stopPrice}
          onChange={(e) => setStopPrice(parseFloat(e.target.value) || 0)}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="relative">
        <input
          type="text"
          placeholder="0.0000"
          value={limitPrice}
          onChange={handleLimitPriceChange}
          className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-sm font-medium">
          USD
        </span>
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
      <CheckBox label="Reduce Only" setIsChecked={setIsReduceOnly} isChecked={isReduceOnly} />
      <LeverageMargin
        selectedAsset={selectedAsset}
        isCross={isCross}
        leverage={leverage}
        setLeverage={setLeverage}
        setIsCross={setIsCross}
      />
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
  )
}

export default StopLimit
