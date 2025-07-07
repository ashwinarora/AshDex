import { useState } from 'react'
import { IPlaceOrderProps } from '.'
import OrderButton from './components/OrderButton'
import LeverageMargin from './components/LeverageMargin'
import AmountInput from './components/AmountInput'
import BuyOrSell from './components/BuyOrSell'
import MarginMode from './components/MarginMode'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import { IconCheckbox, IconInfoCircle, IconSquare } from '@tabler/icons-react'
import { useShallow } from 'zustand/react/shallow'

const StopMarket = ({ selectedAsset }: IPlaceOrderProps) => {
  const { allMids } = useHyperliquidStore(
    useShallow((state) => ({
      allMids: state.allMids
    }))
  )
  const [stopPrice, setStopPrice] = useState(0)
  const [isReduceOnly, setIsReduceOnly] = useState(false)
  const [isBuy, setIsBuy] = useState(true)
  const [assetAmount, setAssetAmount] = useState<string>('')
  const [usdAmount, setUsdAmount] = useState<string>('')
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)
  return (
    <div className="flex flex-col w-full h-full justify-between flex-1">
      <div className="flex flex-col gap-2 px-2 pt-4 h-full w-full flex-1">
        <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
        <Separator orientation="horizontal" />
        <MarginMode isCross={isCross} setIsCross={setIsCross} />
        <LeverageMargin
          selectedAsset={selectedAsset}
          leverage={leverage}
          setLeverage={setLeverage}
        />
        <Separator orientation="horizontal" />
        <label htmlFor="stopPrice" className="text-xs text-white/50">
          Stop Price
        </label>
        <Input
          type="text"
          placeholder="0"
          value={stopPrice}
          onChange={(e) => setStopPrice(parseFloat(e.target.value) || 0)}
          className={'w-full text-right shrink-0 text-white placeholder:text-white'}
        />
        <Separator orientation="horizontal" />
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
        <Separator orientation="horizontal" />
        <div className="flex items-start w-full justify-start h-full gap-2">
          <Toggle
            size={'sm'}
            className="bg-white/5 w-fit"
            pressed={isReduceOnly}
            onPressedChange={setIsReduceOnly}
          >
            {isReduceOnly ? <IconCheckbox className="size-3" /> : <IconSquare className="size-3" />}
            <p className="text-xs font-semibold">Reduce Only</p>
            <IconInfoCircle className="size-3" />
          </Toggle>
        </div>
      </div>
      <div className="flex flex-col gap-2 h-fit w-full p-2">
        <Separator orientation="horizontal" />
        <OrderButton
          selectedAsset={selectedAsset}
          isBuy={isBuy}
          isCross={isCross}
          isPostOnly={false}
          isReduceOnly={isReduceOnly}
          leverage={leverage}
          assetAmount={assetAmount}
          limitPrice={allMids[selectedAsset].toString()}
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
