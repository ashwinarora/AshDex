'use client'
import React, { useState } from 'react'
import BuyOrSell from './components/BuyOrSell'
import AmountInput from './components/AmountInput'
import LeverageMargin from './components/LeverageMargin'
import OrderButton from './components/OrderButton'
import CheckBox from '@/components/common/CheckBox'
import TPSL, { TPSLType } from './components/TPSL'

interface LimitOrderProps {
  selectedAsset: string
}

const LimitOrder: React.FC<LimitOrderProps> = ({ selectedAsset }: LimitOrderProps) => {
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [limitPrice, setLimitPrice] = useState<number>(0)
  const [amount, setAmount] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)
  const [isPostOnly, setIsPostOnly] = useState<boolean>(false)
  const [isReduceOnly, setIsReduceOnly] = useState<boolean>(false)
  const [tpsl, setTpsl] = useState<TPSLType>({
    isTpsl: false,
    takeProfit: 0,
    stopLoss: 0
  })

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLimitPrice = parseFloat(e.target.value) || 0
    setLimitPrice(newLimitPrice)
    setTotal(newLimitPrice * amount)
  }

  return (
    <div className="w-full h-auto">
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />

      <div className="space-y-4">
        <div className="px-4 border-b border-[#FFFFFF0F]">
          <label className="block text-sm font-medium text-gray-300 mb-1">Limit price</label>
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
          isCross={isCross}
          setIsCross={setIsCross}
        />
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-400 border-b border-[#FFFFFF0F] pb-3 px-4">
          <TPSL tpsl={tpsl} setTpsl={setTpsl} />
          <CheckBox label="Post-Only" setIsChecked={setIsPostOnly} isChecked={isPostOnly} />
          <CheckBox label="Reduce Only" setIsChecked={setIsReduceOnly} isChecked={isReduceOnly} />
        </div>
        <div className="p-4 pb-8">
          <OrderButton
            isBuy={isBuy}
            selectedAsset={selectedAsset}
            limitPrice={limitPrice}
            amount={amount}
            leverage={leverage}
            isCross={isCross}
            isPostOnly={isPostOnly}
            isReduceOnly={isReduceOnly}
            tpsl={tpsl}
          />
        </div>
      </div>
    </div>
  )
}

export default LimitOrder
