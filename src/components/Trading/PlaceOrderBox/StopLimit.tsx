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
import { InfoIcon } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { CheckSquare, Square } from 'lucide-react'

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
    <div className="flex flex-col justify-between pt-4 w-full h-full">
      <div className="flex flex-col gap-3 w-full h-full justify-start flex-1">
        <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
        <Separator orientation="horizontal" />
        <div className="flex flex-col gap-3 px-2">
          <MarginMode isCross={isCross} setIsCross={setIsCross} />
          <LeverageMargin
            selectedAsset={selectedAsset}
            leverage={leverage}
            setLeverage={setLeverage}
          />
        </div>
        <Separator orientation="horizontal" />
        <div className="flex flex-col gap-3 px-2">
          <label htmlFor="stopPrice" className="text-xs text-white/50">
            Stop Price
          </label>
          <div className="flex w-full gap-3 items-center">
            <Input
              type="text"
              placeholder="0"
              value={stopPrice}
              onChange={(e) => setStopPrice(parseFloat(e.target.value) || 0)}
              className={'w-full text-right text-white placeholder:text-white'}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 px-2">
          <label htmlFor="limitPrice" className="text-xs text-white/50">
            Limit Price
          </label>
          <div className="flex w-full gap-3 items-center">
            <Input
              type="text"
              placeholder="0"
              value={limitPrice}
              onChange={(e) => handleLimitPriceChange(e)}
              className={'w-full text-right text-white placeholder:text-white'}
            />
            <Button variant={'outline'} size={'sm'} className="text-xs" disabled>
              USD
            </Button>
          </div>
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
        <div className="flex items-start justify-start h-full gap-3 px-2">
          <Toggle
            size={'sm'}
            className="bg-white/5"
            pressed={isReduceOnly}
            onPressedChange={setIsReduceOnly}
          >
            {isReduceOnly ? <CheckSquare className="size-3" /> : <Square className="size-3" />}
            <p className="text-xs font-semibold">Reduce Only</p>
            <InfoIcon className="size-3" />
          </Toggle>
        </div>
      </div>
      <div className="w-full h-fit flex flex-col gap-3 my-3">
        <Separator orientation="horizontal" />
        <div className="w-full h-fit px-2">
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
    </div>
  )
}
export default StopLimit
