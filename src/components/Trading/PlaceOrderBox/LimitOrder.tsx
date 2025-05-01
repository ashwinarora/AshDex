'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import BuyOrSell from './components/BuyOrSell'
import AmountInput from './components/AmountInput'
import LeverageMargin from './components/LeverageMargin'
import OrderButton from './components/OrderButton'
import CheckBox from '@/components/common/CheckBox'
import TPSL, { TPSLType } from './components/TPSL'
import { IPlaceOrderProps } from '.'
import useIsSpot from '@/hooks/useIsSpot'
import AmountInputSpot from './components/AmountInputSpot'
import refreshpurpleIcon from '@/assets/images/refreshpurple2_icon.svg'

const LimitOrder = ({ selectedAsset }: IPlaceOrderProps) => {
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [limitPrice, setLimitPrice] = useState<number>(0)
  const [amount, setAmount] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)
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
  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLimitPrice = parseFloat(e.target.value) || 0
    setLimitPrice(newLimitPrice)
    setTotal(newLimitPrice * amount)
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="border-b border-white/10">
        <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          <div className="px-4 border-b border-[#FFFFFF0F] mb-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Limit price</label>
            <div className="relative">
              <input
                type="text"
                placeholder="0.0000"
                value={limitPrice}
                onChange={handleLimitPriceChange}
                className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
              />
              <span className="absolute right-2 top-1/2 flex text-sm items-center gap-x-1.5 -translate-y-1/2 text-[#7D67FF] font-medium">
                <Image
                  src={refreshpurpleIcon}
                  style={{ width: 15, height: 'auto' }}
                  alt="Refresh Icon"
                  className="w-3.5 h-3.5"
                />
                Last
              </span>
            </div>
          </div>
          {isSpot ? (
            <AmountInputSpot
              selectedAsset={selectedAsset}
              amount={amount}
              setAmount={setAmount}
              total={total}
              setTotal={setTotal}
              limitPrice={limitPrice}
              isBuy={isBuy}
            />
          ) : (
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
          )}
          {!isSpot && (
            <LeverageMargin
              selectedAsset={selectedAsset}
              leverage={leverage}
              setLeverage={setLeverage}
              isCross={isCross}
              setIsCross={setIsCross}
            />
          )}
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 border-b border-[#FFFFFF0F] pb-2 px-4">
            {!isSpot && (
              <>
                <TPSL tpsl={tpsl} setTpsl={setTpsl} />
                <CheckBox
                  label="Reduce Only"
                  setIsChecked={setIsReduceOnly}
                  isChecked={isReduceOnly}
                />
              </>
            )}
            <CheckBox label="Post-Only" setIsChecked={setIsPostOnly} isChecked={isPostOnly} />
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-white/10">
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
  )
}
export default LimitOrder
