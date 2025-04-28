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
    <div>
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      <div className="border-b px-4 mb-3 border-[#FFFFFF0F]">
        <label className="block mb-1 text-sm font-medium text-[#8B8BA0]">Stop Price:</label>
        <input
          type="text"
          value={stopPrice}
          onChange={(e) => setStopPrice(parseFloat(e.target.value) || 0)}
          className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
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
      <div className="px-4 pb-3">
        <CheckBox label="Reduce Only" setIsChecked={setIsReduceOnly} isChecked={isReduceOnly} />
      </div>
      <LeverageMargin
        selectedAsset={selectedAsset}
        isCross={isCross}
        leverage={leverage}
        setLeverage={setLeverage}
        setIsCross={setIsCross}
      />
      <div className="p-4">
        <OrderButton
          selectedAsset={selectedAsset}
          isBuy={isBuy}
          isCross={isCross}
          isPostOnly={false}
          isReduceOnly={isReduceOnly}
          leverage={leverage}
          amount={amount}
          limitPrice={allMids[selectedAsset] * (isBuy ? 1.1 : 0.9)}
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
