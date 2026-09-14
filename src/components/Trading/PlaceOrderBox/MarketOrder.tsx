'use client'
import { useMemo, useState, useCallback } from 'react'
import BuyOrSell from './components/BuyOrSell'
import AmountInput from './components/AmountInput'
import LeverageMargin from './components/LeverageMargin'
import OrderButton from './components/OrderButton'
import { IPlaceOrderProps } from '.'
import useIsSpot from '@/hooks/useIsSpot'
import AmountInputSpot from './components/AmountInputSpot'
import TPSL, { TPSLType } from './components/TPSL'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { usePerpTradingAccount } from '@/hooks/usePerpTradingAccount'
import { MAX_DECIMALS_PERP, MAX_DECIMALS_SPOT } from '@/utils/constants'
import { getPerpsUniverseIndex, calculateLiquidationPrice } from '@/utils/utils'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { Toggle } from '@/components/ui/toggle'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { IconCheckbox, IconChevronDown, IconInfoCircle, IconSquare } from '@tabler/icons-react'
import { useShallow } from 'zustand/react/shallow'
import Fees from './components/Fees'
import { useAgentApproval } from '@/context/EstablishConnection'

const MarketOrder = ({ selectedAsset, isRTL }: IPlaceOrderProps) => {
  const { allMids, perpsMeta } = useHyperliquidStore(
    useShallow((state) => ({
      allMids: state.allMids,
      perpsMeta: state.perpsMeta
    }))
  )
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [assetAmount, setAssetAmount] = useState<string>('')
  const [usdAmount, setUsdAmount] = useState<string>('')
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)
  const [isReduceOnly, setIsReduceOnly] = useState<boolean>(false)
  const [slippage, setSlippage] = useState<number>(8) // Default 8% slippage just like hyperliquid
  const [tpsl, setTpsl] = useState<TPSLType>({
    isTpsl: false,
    takeProfit: 0,
    stopLoss: 0
  })
  const isSpot = useIsSpot()
  const { data: spotMeta } = useSpotMeta()
  const { isAgentApproved, currentFeeApproval } = useAgentApproval()
  const isTradingEnabled = isAgentApproved && currentFeeApproval > 0
  const crossAccountValue = usePerpTradingAccount().accountValue
  const [isError, setIsError] = useState<boolean>(false)

  const szDecimals = useMemo(() => {
    if (isSpot) {
      const tokenData = spotMeta?.tokens.find((token) => token.name.includes(selectedAsset))
      return Number(tokenData?.szDecimals) || 0
    } else {
      const assetIndex = getPerpsUniverseIndex(perpsMeta?.universe || [], selectedAsset)
      if (assetIndex === -1) return 0
      return Number(perpsMeta?.universe[assetIndex].szDecimals) || 0
    }
  }, [perpsMeta, selectedAsset, isSpot, spotMeta])

  const getFormattedPrice = useCallback(() => {
    const maxDecimals = isSpot ? MAX_DECIMALS_SPOT : MAX_DECIMALS_PERP
    const allowedDecimals = maxDecimals - szDecimals

    const slippageMultiplier = isBuy ? 1 + slippage / 100 : 1 - slippage / 100
    const rawPrice = (Number(allMids[selectedAsset]) * slippageMultiplier).toString()

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
  }, [allMids, selectedAsset, slippage, isBuy, szDecimals, isSpot])

  const liquidationPrice = useMemo(() => {
    // BUG-001: previously used getFormattedPrice() as entryPrice. That price
    // is mark × (1 ± slippage) — inflated for a long, deflated for a short —
    // and it's what the order submits at, not what the position opens at.
    // Feeding the inflated price into the liq-price formula for a long
    // produced liq > mark (impossible), which is the exact QA symptom.
    //
    // The expected fill for a market order is ~mark; use it as the entry
    // approximation for the pre-order preview.
    const markPriceRaw = Number(allMids[selectedAsset])
    if (
      !markPriceRaw ||
      !assetAmount ||
      Number(assetAmount) === 0 ||
      !Number.isFinite(markPriceRaw)
    ) {
      return 0
    }

    const assetIndex = getPerpsUniverseIndex(perpsMeta?.universe || [], selectedAsset)
    const maxLeverage = perpsMeta?.universe[assetIndex]?.maxLeverage || 1

    return calculateLiquidationPrice({
      entryPrice: markPriceRaw,
      positionSize: Number(assetAmount),
      leverage,
      isBuy,
      usdAmount: Number(usdAmount),
      isCross,
      maxLeverage,
      crossAccountValue
    })
  }, [
    allMids,
    assetAmount,
    leverage,
    isBuy,
    usdAmount,
    isCross,
    perpsMeta,
    selectedAsset,
    crossAccountValue
  ])

  return (
    <div className="flex flex-col w-full h-full justify-between flex-1">
      <div className="flex flex-col gap-2 px-2 h-full w-full flex-1">
        <Separator className="my-1" orientation="horizontal" />
        <BuyOrSell
          isCross={isCross}
          setIsCross={setIsCross}
          isBuy={isBuy}
          setIsBuy={setIsBuy}
          isRTL={isRTL}
          selectedAsset={selectedAsset}
        />
        {!isSpot ? (
          <>
            <LeverageMargin
              selectedAsset={selectedAsset}
              leverage={leverage}
              setLeverage={setLeverage}
              isRTL={isRTL}
            />
            <Separator orientation="horizontal" />
          </>
        ) : (
          <Separator orientation="horizontal" className="bg-transparent" />
        )}
        {isSpot ? (
          <AmountInputSpot
            selectedAsset={selectedAsset}
            assetAmount={assetAmount}
            setAssetAmount={setAssetAmount}
            usdAmount={usdAmount}
            setUsdAmount={setUsdAmount}
            limitPrice={allMids[selectedAsset]?.toString() || '0'}
            isBuy={isBuy}
            isRTL={isRTL}
            setIsError={setIsError}
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
            isRTL={isRTL}
            setIsError={setIsError}
          />
        )}
        <Separator orientation="horizontal" />

        <div
          className={cn(
            'flex items-center justify-center h-fit gap-1',
            isRTL && 'flex-row-reverse flex-wrap'
          )}
        >
          {!isSpot && (
            <Toggle
              size={'sm'}
              className="bg-white/10"
              pressed={isReduceOnly}
              onPressedChange={setIsReduceOnly}
            >
              {isReduceOnly ? (
                <IconCheckbox className="size-3" />
              ) : (
                <IconSquare className="size-3" />
              )}
              <p className="text-xs font-semibold">{'Reduce Only'}</p>
              <IconInfoCircle className="size-3" />
            </Toggle>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'bg-white/10 flex-2 text-xs',
                  tpsl.isTpsl ? 'bg-accent text-accent-foreground' : 'bg-white/10 text-white/70'
                )}
                size={'sm'}
              >
                {'TP/SL'}
                <IconChevronDown className="size-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <TPSL
                limitPrice={allMids[selectedAsset]}
                isBuy={isBuy}
                leverage={leverage}
                tpsl={tpsl}
                setTpsl={setTpsl}
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'bg-white/10 flex-1 text-xs',
                  slippage > 0 ? 'bg-accent text-accent-foreground' : 'bg-white/10 text-white/70'
                )}
                size={'sm'}
              >
                {'Slippage'}
                <IconChevronDown className="size-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" aria-describedby="slippage-popover-description">
              <div className="flex flex-col gap-3">
                <p id="slippage-popover-description" className="text-xs text-white/70">
                  {
                    'Max slippage only affects market orders placed on Spots & Perps. Close & TP/SL orders will use max slippage of 8%.'
                  }
                </p>
                <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
                  <Slider
                    min={0.1}
                    max={100}
                    step={0.1}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    value={[slippage]}
                    onValueChange={(value) => setSlippage(value[0])}
                  />

                  <Input
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                    dir={isRTL ? 'rtl' : 'ltr'}
                    value={slippage}
                    className="w-20 shrink-0"
                    data-testid="preorder-slippage-input"
                    onChange={(e) => {
                      // Clamp on-change as well as on-blur (Round-2 B16).
                      // Otherwise the user can paste `200` and, if they click
                      // Buy before Tab-ing out, the raw 200 is what the
                      // order carries.
                      const parsed = Number(e.target.value)
                      if (!Number.isFinite(parsed)) return
                      const clamped = Math.max(0.1, Math.min(100, parsed))
                      setSlippage(clamped)
                    }}
                    onBlur={(e) => {
                      // Belt-and-suspenders: if the on-change guard was
                      // bypassed (e.g. a raw programmatic change), the
                      // on-blur clamp still runs.
                      const parsed = Number(e.target.value)
                      const clamped = Math.max(
                        0.1,
                        Math.min(100, Number.isFinite(parsed) && parsed > 0 ? parsed : slippage)
                      )
                      setSlippage(clamped)
                    }}
                  />
                  <span className="text-white/70">%</span>
                </div>
                <ToggleGroup
                  size={'sm'}
                  className={cn(
                    'flex mt-1 items-center bg-white/10 justify-between w-full',
                    isRTL && 'flex-row-reverse'
                  )}
                  type="single"
                  value={slippage.toString()}
                  onValueChange={(value) => value !== '' && setSlippage(parseInt(value, 10))}
                >
                  {[1, 2, 5, 10, 20].map((value, index) => (
                    <ToggleGroupItem
                      key={`leverage-tick-${value}-${index}`}
                      value={value.toString()}
                      className={cn(
                        'cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
                        slippage === value
                          ? 'bg-primary text-white'
                          : 'bg-transparent text-white/70',
                        isRTL
                          ? 'first:rounded-r-md last:rounded-l-md'
                          : 'first:rounded-l-md last:rounded-r-md'
                      )}
                    >
                      {value}%
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Separator orientation="horizontal" />
        <div className="flex w-full flex-col gap-2 text-xs">
          {!isSpot && (
            <>
              <div className={cn('flex justify-between', isRTL && 'flex-row-reverse')}>
                <p className="text-white/70">{'Liquidation Price'}</p>
                <p className="text-white">
                  {/*
                    Show N/A when the underlying calc has nothing to work with
                    (empty size or price). Rendering the numeric literal `0`
                    reads like a real liquidation at $0 (BUG-014). Matches the
                    empty-form behaviour of the Limit-order variant.
                  */}
                  {isTradingEnabled && Number(liquidationPrice) > 0 ? liquidationPrice : 'N/A'}
                </p>
              </div>

              <div className={cn('flex justify-between', isRTL && 'flex-row-reverse')}>
                <p className="text-white/70">{'Margin Required'}</p>
                <p className="text-white">
                  {isTradingEnabled
                    ? `$${((Number(assetAmount) * Number(allMids[selectedAsset])) / leverage).toFixed(2)}`
                    : 'N/A'}
                </p>
              </div>
            </>
          )}
          <div className={cn('flex justify-between', isRTL && 'flex-row-reverse')}>
            <p className="text-white/70">{'Order Value'}</p>
            <p className="text-white">
              {isTradingEnabled ? `$${Number(usdAmount).toFixed(2)}` : 'N/A'}
            </p>
          </div>
          <Fees isSpot={isSpot} isRTL={isRTL} />
        </div>
      </div>
      <div className="flex flex-col gap-2 h-fit w-full p-2">
        <Separator orientation="horizontal" />
        <OrderButton
          isBuy={isBuy}
          selectedAsset={selectedAsset}
          limitPrice={getFormattedPrice()}
          assetAmount={assetAmount}
          leverage={leverage}
          isCross={isCross}
          isPostOnly={false}
          isReduceOnly={isSpot ? false : isReduceOnly}
          tpsl={tpsl}
          isMarket={true}
          isError={isError}
        />
      </div>
    </div>
  )
}
export default MarketOrder
