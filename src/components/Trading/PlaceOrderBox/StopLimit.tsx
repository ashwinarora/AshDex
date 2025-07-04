import React, { useState } from 'react'
import { IPlaceOrderProps } from '.'
import OrderButton from './components/OrderButton'
import LeverageMargin from './components/LeverageMargin'
import AmountInput from './components/AmountInput'
import BuyOrSell from './components/BuyOrSell'
import MarginMode from './components/MarginMode'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { IconCheckbox, IconInfoCircle, IconSquare } from '@tabler/icons-react'

const StopLimit = ({ selectedAsset }: IPlaceOrderProps) => {
  const [stopPrice, setStopPrice] = useState(0)
  const [limitPrice, setLimitPrice] = useState('')
  const [isReduceOnly, setIsReduceOnly] = useState(false)
  const [isBuy, setIsBuy] = useState(true)
  const [assetAmount, setAssetAmount] = useState<string>('')
  const [usdAmount, setUsdAmount] = useState<string>('')
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setLimitPrice(input)
    const numValue = parseFloat(input) || 0
    setUsdAmount((numValue * parseFloat(assetAmount)).toString())
  }

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
          className={'w-full shrink-0 text-right text-white placeholder:text-white'}
        />
        <label htmlFor="limitPrice" className="text-xs text-white/50">
          Limit Price
        </label>
        <div className="flex w-full gap-3 items-center">
          <Input
            type="text"
            placeholder="0"
            value={limitPrice}
            onChange={(e) => handleLimitPriceChange(e)}
            className={'w-full flex-1 text-right text-white placeholder:text-white'}
          />
          <Button variant={'outline'} size={'sm'} className="text-xs" disabled>
            USD
          </Button>
        </div>
        <Separator orientation="horizontal" />
        <AmountInput
          selectedAsset={selectedAsset}
          assetAmount={assetAmount}
          setAssetAmount={setAssetAmount}
          usdAmount={usdAmount}
          setUsdAmount={setUsdAmount}
          limitPrice={limitPrice}
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
