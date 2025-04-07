import React, { useState } from 'react'
import { IPlaceOrderProps } from '.'
import OrderButton from './components/OrderButton'
import LeverageMargin from './components/LeverageMargin'
import AmountInput from './components/AmountInput'
import BuyOrSell from './components/BuyOrSell'
import CheckBox from '@/components/common/CheckBox'
import { useHyperLiquid } from '@/context/HyperLiquid'

const StopMarket = ({ selectedAsset }: IPlaceOrderProps) => {
  const { allMids } = useHyperLiquid()
  const [stopPrice, setStopPrice] = useState(0)
  const [isReduceOnly, setIsReduceOnly] = useState(false)
  const [isBuy, setIsBuy] = useState(true)
  const [amount, setAmount] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)

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

      <AmountInput
        selectedAsset={selectedAsset}
        amount={amount}
        setAmount={setAmount}
        total={total}
        setTotal={setTotal}
        limitPrice={allMids[selectedAsset]}
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
        isReduceOnly={false}
        leverage={leverage}
        amount={amount}
        limitPrice={allMids[selectedAsset] * (isBuy ? 1.1 : 0.9) }
        stopOrder={{
          isMarket: false,
          tpsl: 'sl',
          triggerPx: stopPrice
        }}
      />
    </div>
  )
}

export default StopMarket
