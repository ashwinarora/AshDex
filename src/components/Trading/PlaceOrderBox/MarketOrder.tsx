'use client'
import { useState } from 'react'
import BuyOrSell from './components/BuyOrSell'
import AmountInput from './components/AmountInput'
import { useHyperLiquid } from '@/context/HyperLiquid'
import LeverageMargin from './components/LeverageMargin'
import OrderButton from './components/OrderButton'
import CheckBox from '@/components/common/CheckBox'
import { IPlaceOrderProps } from '.'
import useIsSpot from '@/hooks/useIsSpot'
import AmountInputSpot from './components/AmountInputSpot'
import TPSL, { TPSLType } from './components/TPSL'
import MarginMode from './components/MarginMode'

const MarketOrder = ({ selectedAsset }: IPlaceOrderProps) => {
  const { allMids } = useHyperLiquid()
  const [isBuy, setIsBuy] = useState<boolean>(true)
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
  const isSpot = useIsSpot()

  return (
    <div className="w-full h-full flex flex-col">
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-1">
          <MarginMode isCross={isCross} setIsCross={setIsCross} />

          {isSpot ? (
            <AmountInputSpot
              selectedAsset={selectedAsset}
              amount={amount}
              setAmount={setAmount}
              total={total}
              setTotal={setTotal}
              limitPrice={allMids[selectedAsset]}
              isBuy={isBuy}
            />
          ) : (
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
          )}
          {!isSpot && (
            <LeverageMargin
              selectedAsset={selectedAsset}
              leverage={leverage}
              setLeverage={setLeverage}
            />
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
          limitPrice={allMids[selectedAsset] * (isBuy ? 1.1 : 0.9)}
          amount={amount}
          leverage={leverage}
          isCross={isCross}
          isPostOnly={isPostOnly}
          isReduceOnly={isReduceOnly}
        />
      </div>
    </div>
  )
}
export default MarketOrder
