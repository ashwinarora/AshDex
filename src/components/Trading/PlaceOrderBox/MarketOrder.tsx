'use client'
import { useMemo, useState, useEffect } from 'react'
import BuyOrSell from './components/BuyOrSell'
import AmountInput from './components/AmountInput'
import LeverageMargin from './components/LeverageMargin'
import OrderButton from './components/OrderButton'
import { IPlaceOrderProps } from '.'
import useIsSpot from '@/hooks/useIsSpot'
import AmountInputSpot from './components/AmountInputSpot'
import TPSL, { TPSLType } from './components/TPSL'
import MarginMode from './components/MarginMode'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { MAX_DECIMALS_PERP, MAX_DECIMALS_SPOT } from '@/utils/constants'
import { getUniverseIndex, calculateLiquidationPrice } from '@/utils/utils'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import { Toggle } from '@/components/ui/toggle'
import { CheckSquare, ChevronDown, InfoIcon, Square } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import SetPrice from './components/SetPrice'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const MarketOrder = ({ selectedAsset }: IPlaceOrderProps) => {
  const { allMids, clearingHouseState } = useHyperliquid()
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [assetAmount, setAssetAmount] = useState<string>('')
  const [usdAmount, setUsdAmount] = useState<string>('')
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)
  const [isReduceOnly, setIsReduceOnly] = useState<boolean>(false)
  const [slippage, setSlippage] = useState<number>(1) // Default 1% slippage
  const [tpsl, setTpsl] = useState<TPSLType>({
    isTpsl: false,
    takeProfit: 0,
    stopLoss: 0
  })
  const isSpot = useIsSpot()
  const { data: spotMeta } = useSpotMeta()
  const { data: universe } = usePerpsUniverse()
  const [crossAccountValue, setCrossAccountValue] = useState(0)

  useEffect(() => {
    setCrossAccountValue(clearingHouseState?.marginSummary?.accountValue || 0)
  }, [clearingHouseState])

  const szDecimals = useMemo(() => {
    if (isSpot) {
      const tokenData = spotMeta.tokens.find((token) => token.name.includes(selectedAsset))
      return tokenData?.szDecimals || 0
    } else {
      const assetIndex = getUniverseIndex(universe, selectedAsset)
      if (assetIndex === -1) return 0
      return universe[assetIndex].szDecimals || 0
    }
  }, [universe, selectedAsset, isSpot, spotMeta])

  const getFormattedPrice = () => {
    const maxDecimals = isSpot ? MAX_DECIMALS_SPOT : MAX_DECIMALS_PERP
    const allowedDecimals = maxDecimals - szDecimals

    const slippageMultiplier = isBuy ? 1 + slippage / 100 : 1 - slippage / 100
    const rawPrice = (allMids[selectedAsset] * slippageMultiplier).toString()

    // Split into integer and decimal parts
    const [intPart, decPart] = rawPrice.split('.')

    // Count significant figures in integer part
    const intSigFigs = intPart.replace(/^0+/, '').length

    // If integer part has 5 or more significant figures, return just the integer part
    if (intSigFigs >= 5) {
      return intPart
    }

    // If no decimal part, return the integer as is
    if (!decPart) {
      return intPart
    }

    // For decimal numbers, check total significant figures
    const totalSigFigs = intSigFigs + decPart.length
    if (totalSigFigs > 5) {
      const truncateLength = 5 - intSigFigs
      if (truncateLength > 0) {
        return `${intPart}.${decPart.slice(0, truncateLength)}`
      }
      return intPart
    }

    // Handle decimal places restriction
    const maxAllowedDecimals = Math.min(allowedDecimals, decPart.length)
    return `${intPart}.${decPart.slice(0, maxAllowedDecimals)}`
  }

  const liquidationPrice = useMemo(() => {
    if (
      !getFormattedPrice() ||
      !assetAmount ||
      Number(getFormattedPrice()) === 0 ||
      Number(assetAmount) === 0
    ) {
      return 0
    }

    const assetIndex = getUniverseIndex(universe, selectedAsset)
    const maxLeverage = universe[assetIndex]?.maxLeverage || 1

    return calculateLiquidationPrice({
      entryPrice: Number(getFormattedPrice()),
      positionSize: Number(assetAmount),
      leverage,
      isBuy,
      usdAmount: Number(usdAmount),
      isCross,
      maxLeverage,
      crossAccountValue
    })
  }, [
    getFormattedPrice,
    assetAmount,
    leverage,
    isBuy,
    usdAmount,
    isCross,
    universe,
    selectedAsset,
    crossAccountValue
  ])

  return (
    <div className="flex flex-col justify-start pt-4 w-full h-full">
      <div className="flex flex-col gap-3 w-full h-full justify-start flex-1">
        <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
        {!isSpot && (
          <>
            <Separator orientation="horizontal" />
            <div className="flex flex-col gap-3 px-2">
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
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-white/50 text-xs whitespace-nowrap">
              Market price (USD)
            </p>
          </div>
          <SetPrice
            selectedAsset={selectedAsset}
            limitPrice={getFormattedPrice()}
            setLimitPrice={() => {}}
            setUsdAmount={setUsdAmount}
            assetAmount={assetAmount}
            disabled={true}
          />
        </div>
        {isSpot ? (
          <AmountInputSpot
            selectedAsset={selectedAsset}
            assetAmount={assetAmount}
            setAssetAmount={setAssetAmount}
            usdAmount={usdAmount}
            setUsdAmount={setUsdAmount}
            limitPrice={allMids[selectedAsset]?.toString() || '0'}
            isBuy={isBuy}
          />
        ) : (
          <AmountInput
            selectedAsset={selectedAsset}
            assetAmount={assetAmount}
            setAssetAmount={setAssetAmount}
            usdAmount={usdAmount}
            setUsdAmount={setUsdAmount}
            limitPrice={allMids[selectedAsset]?.toString() || '0'}
            leverage={leverage}
            isReduceOnly={isReduceOnly}
            isBuy={isBuy}
          />
        )}
        <Separator orientation="horizontal" />
        <div className="flex items-center justify-center h-full gap-3 px-2">
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'bg-white/5 flex-1 text-xs',
                  slippage > 0 ? 'bg-accent text-accent-foreground' : 'bg-white/5 text-white/50'
                )}
                size={'sm'}
              >
                Slippage
                <ChevronDown className="size-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <div className="flex flex-col gap-3">
                <p className="text-xs text-white/50">
                  Max slippage only affects market orders placed from the order form. Closing
                  positions will use max slippage of 8% and market TP/SL orders will use max
                  slippage of 10%.
                </p>
                <div className="flex items-center gap-3">
                  <Slider
                    min={0.1}
                    max={100}
                    step={0.1}
                    value={[slippage]}
                    onValueChange={(value) => setSlippage(value[0])}
                  />

                  <Input
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                    value={slippage}
                    className="w-20"
                    onChange={(e) => setSlippage(Number(e.target.value))}
                  />
                  <span className="text-white/50">%</span>
                </div>
                <ToggleGroup
                  size={'sm'}
                  className="flex mt-1 items-center bg-white/5 justify-between w-full"
                  type="single"
                  value={slippage.toString()}
                  onValueChange={(value) => value !== '' && setSlippage(parseInt(value, 10))}
                >
                  {[1, 2, 5, 10, 20].map((value, index) => (
                    <ToggleGroupItem
                      key={`leverage-tick-${value}-${index}`}
                      value={value.toString()}
                      className={cn(
                        'first:rounded-l-md last:rounded-r-md cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
                        slippage === value
                          ? 'bg-primary text-white'
                          : 'bg-transparent text-white/50'
                      )}
                    >
                      {value}%
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </PopoverContent>
          </Popover>
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
                limitPrice={getFormattedPrice()}
                isBuy={isBuy}
                leverage={leverage}
                tpsl={tpsl}
                setTpsl={setTpsl}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="w-full h-full flex flex-col gap-3 mt-2">
        <Separator orientation="horizontal" />
        <div className="w-full h-fit px-2">
          <OrderButton
            isBuy={isBuy}
            selectedAsset={selectedAsset}
            limitPrice={getFormattedPrice()}
            assetAmount={assetAmount}
            leverage={leverage}
            isCross={isCross}
            isPostOnly={false}
            isReduceOnly={isReduceOnly}
            tpsl={tpsl}
          />
        </div>
        <div className="flex w-full flex-col gap-3 px-2 pb-2 text-xs">
          {!isSpot && (
            <>
              <div className="flex justify-between">
                <p className="text-white/50">Liquidation Price</p>
                <p className="text-white">{liquidationPrice}</p>
              </div>

              <div className="flex justify-between">
                <p className="text-white/50">Margin Required</p>
                <p className="text-white">
                  ${((Number(assetAmount) * Number(allMids[selectedAsset])) / leverage).toFixed(2)}
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
export default MarketOrder
