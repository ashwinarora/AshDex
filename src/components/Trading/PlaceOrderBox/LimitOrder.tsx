'use client'
import { useState, useEffect } from 'react'
import BuyOrSell from './components/BuyOrSell'
import AmountInput from './components/AmountInput'
import LeverageMargin from './components/LeverageMargin'
import TPSL, { TPSLType } from './components/TPSL'
import { IPlaceOrderProps } from '.'
import useIsSpot from '@/hooks/useIsSpot'
import AmountInputSpot from './components/AmountInputSpot'
import MarginMode from './components/MarginMode'
import SetPrice from './components/SetPrice'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { calculateLiquidationPrice } from '@/utils/utils'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import { getUniverseIndex } from '@/utils/utils'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Toggle } from '@/components/ui/toggle'
import { CheckSquare, ChevronDown, InfoIcon, Square } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import OrderButton from './components/OrderButton'

const LimitOrder = ({ selectedAsset }: IPlaceOrderProps) => {
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [limitPrice, setLimitPrice] = useState<string>('')
  const [assetAmount, setAssetAmount] = useState<string>('')
  const [usdAmount, setUsdAmount] = useState<string>('')
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
  const { clearingHouseState } = useHyperliquid()
  const { data: universe } = usePerpsUniverse()

  const [crossAccountValue, setCrossAccountValue] = useState(0)

  useEffect(() => {
    setCrossAccountValue(clearingHouseState?.marginSummary?.accountValue || 0)
  }, [clearingHouseState])

  const liquidationPrice = () => {
    if (!limitPrice || !assetAmount || Number(limitPrice) === 0 || Number(assetAmount) === 0) {
      return 0
    }

    const assetIndex = getUniverseIndex(universe, selectedAsset)
    const maxLeverage = universe[assetIndex]?.maxLeverage || 1

    return calculateLiquidationPrice({
      entryPrice: Number(limitPrice),
      positionSize: Number(assetAmount),
      leverage,
      isBuy,
      usdAmount: Number(usdAmount),
      isCross,
      maxLeverage,
      crossAccountValue
    })
  }

  return (
    <div className="flex flex-col justify-start pt-4 w-full h-full">
      <div className="flex flex-col gap-2 w-full h-full justify-between flex-1">
        <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
        {!isSpot && (
          <>
            <Separator orientation="horizontal" />
            <div className="flex flex-col gap-2 px-2">
              <MarginMode isCross={isCross} setIsCross={setIsCross} />
              <LeverageMargin
                selectedAsset={selectedAsset}
                leverage={leverage}
                setLeverage={setLeverage}
              />
            </div>
          </>
        )}
        <Separator orientation="horizontal" />
        <div className="flex flex-col items-start px-2 rounded-md align-middle gap-2 w-full">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-white/50 text-xs whitespace-nowrap">Limit price (USD)</p>
          </div>
          <SetPrice
            selectedAsset={selectedAsset}
            limitPrice={limitPrice}
            setLimitPrice={setLimitPrice}
            setUsdAmount={setUsdAmount}
            assetAmount={assetAmount}
          />
        </div>
        {isSpot ? (
          <AmountInputSpot
            selectedAsset={selectedAsset}
            assetAmount={assetAmount}
            setAssetAmount={setAssetAmount}
            usdAmount={usdAmount}
            setUsdAmount={setUsdAmount}
            limitPrice={limitPrice}
            isBuy={isBuy}
          />
        ) : (
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
        )}
        <Separator orientation="horizontal" />
        <div className="flex items-center justify-center h-fit gap-2 px-2">
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
          <Toggle
            size={'sm'}
            className="bg-white/5"
            pressed={isPostOnly}
            onPressedChange={setIsPostOnly}
          >
            {isPostOnly ? <CheckSquare className="size-3" /> : <Square className="size-3" />}
            <p className="text-xs font-semibold">Post Only</p>
            <InfoIcon className="size-3" />
          </Toggle>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'bg-white/5 flex-1 text-xs',
                  tpsl.isTpsl ? 'bg-accent text-accent-foreground' : 'bg-white/5 text-white/50'
                )}
                size={'sm'}
              >
                TP/SL
                <ChevronDown className="size-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <TPSL
                limitPrice={limitPrice}
                isBuy={isBuy}
                leverage={leverage}
                tpsl={tpsl}
                setTpsl={setTpsl}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="w-full h-fit flex flex-col gap-2 mt-2">
        <Separator orientation="horizontal" />
        <div className="w-full h-fit px-2">
          <OrderButton
            isBuy={isBuy}
            selectedAsset={selectedAsset}
            limitPrice={limitPrice}
            assetAmount={assetAmount}
            leverage={leverage}
            isCross={isCross}
            isPostOnly={isPostOnly}
            isReduceOnly={isReduceOnly}
            tpsl={tpsl}
          />
        </div>
        <div className="flex w-full flex-col gap-2 px-2 pb-2 text-xs">
          {!isSpot && (
            <>
              <div className="flex justify-between">
                <p className="text-white/50">Liquidation Price</p>
                <p className="text-white">{liquidationPrice()}</p>
              </div>

              <div className="flex justify-between">
                <p className="text-white/50">Margin Required</p>
                <p className="text-white">
                  ${((Number(assetAmount) * Number(limitPrice)) / leverage).toFixed(2)}
                </p>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <p className="text-white/50">Order Value</p>
            <p className="text-white">${Number(usdAmount).toFixed(2)} </p>
          </div>
          <div className="flex justify-between">
            <p className="text-white/50">Fees</p>
            <p className="text-white">0.0% / 0.0%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default LimitOrder

{
  /* 
        <div className='w-full h-fit flex flex-col items-center justify-start gap-2 p-2'>
          <OrderButton
            isBuy={isBuy}
            selectedAsset={selectedAsset}
            limitPrice={limitPrice}
            assetAmount={assetAmount}
            leverage={leverage}
            isCross={isCross}
            isPostOnly={isPostOnly}
            isReduceOnly={isReduceOnly}
            tpsl={tpsl}
          />


      </div> */
}
