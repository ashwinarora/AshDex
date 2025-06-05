import { useState } from 'react';
import { IPlaceOrderProps } from '.';
import OrderButton from './components/OrderButton';
import LeverageMargin from './components/LeverageMargin';
import AmountInput from './components/AmountInput';
import BuyOrSell from './components/BuyOrSell';
import CheckBox from '@/components/common/CheckBox';
import MarginMode from './components/MarginMode';
import { useHyperliquid } from '@/store/HyperliquidStore';

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
    <div className="flex flex-col w-full h-full">
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          <div className="mb-1 px-4 border-[#FFFFFF0F] border-b">
            <label className="block mb-0.5 font-medium text-gray-300 text-xs">Stop Price</label>
            <input
              type="text"
              value={stopPrice}
              onChange={(e) => setStopPrice(parseFloat(e.target.value) || 0)}
              className="p-1.5 rounded-md focus:outline-none w-full font-medium text-sm focus:none focus:none"
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

          <div className="px-4 pb-1 text-gray-400 text-xs">
            <CheckBox label="Reduce Only" setIsChecked={setIsReduceOnly} isChecked={isReduceOnly} />
          </div>
        </div>
      </div>
      <div className="p-4 border-white/10 border-t">
        <OrderButton
          selectedAsset={selectedAsset}
          isBuy={isBuy}
          isCross={isCross}
          isPostOnly={false}
          isReduceOnly={isReduceOnly}
          leverage={leverage}
          assetAmount={assetAmount}
          limitPrice={(allMids[selectedAsset] * (isBuy ? 1.1 : 0.9)).toString()}
          isInvalid={!assetAmount || !stopPrice}
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
