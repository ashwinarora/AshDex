'use client'
import { useState, useEffect } from 'react'
import BuyOrSell from './components/BuyOrSell'
import AmountInput from './components/AmountInput'
import LeverageMargin from './components/LeverageMargin'
import TPSL, { TPSLType } from './components/TPSL'
import { IPlaceOrderProps } from '.'
import useIsSpot from '@/hooks/useIsSpot'
import AmountInputSpot from './components/AmountInputSpot'
import SetPrice from './components/SetPrice'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { calculateLiquidationPrice } from '@/utils/utils'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Toggle } from '@/components/ui/toggle'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import OrderButton from './components/OrderButton'
import { getPerpsUniverseIndex } from '@/utils/utils'
import { IconCheckbox, IconChevronDown, IconInfoCircle, IconSquare } from '@tabler/icons-react'
import { useShallow } from 'zustand/react/shallow'
import { useTranslate } from '@tolgee/react'
import Fees from './components/Fees'
import { useTradeUIStore } from '@/store/TradeUIStore'
import { useSpotMeta } from '@/hooks/useSpotMeta'

const LimitOrder = ({ selectedAsset, isRTL }: IPlaceOrderProps) => {
  const { t } = useTranslate()
  const {
    requestedLimitPrice,
    requestedAssetAmount,
    clearRequestedLimitPrice,
    clearRequestedAssetAmount
  } = useTradeUIStore()
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
  const { clearingHouseState, perpsMeta, spotState } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState,
      perpsMeta: state.perpsMeta,
      spotState: state.spotState
    }))
  )
  const { spotKeyToName, data: spotMeta } = useSpotMeta()

  const [crossAccountValue, setCrossAccountValue] = useState(0)

  useEffect(() => {
    setCrossAccountValue(Number(clearingHouseState?.marginSummary.accountValue) || 0)
  }, [clearingHouseState])

  const liquidationPrice = () => {
    if (!limitPrice || !assetAmount || Number(limitPrice) === 0 || Number(assetAmount) === 0) {
      return 0
    }

    const assetIndex = getPerpsUniverseIndex(perpsMeta?.universe || [], selectedAsset)
    const maxLeverage = perpsMeta?.universe[assetIndex]?.maxLeverage || 1

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

  useEffect(() => {
    if (!requestedLimitPrice && !requestedAssetAmount) return

    const price = Number(requestedLimitPrice ?? limitPrice)
    if (!price || Number.isNaN(price)) {
      if (requestedLimitPrice) setLimitPrice(requestedLimitPrice)
      clearRequestedLimitPrice()
      return
    }

    // Determine max tradable size in asset units
    let maxAssetTradable = Infinity

    if (!isSpot) {
      if (clearingHouseState) {
        const assetIndex = getPerpsUniverseIndex(perpsMeta?.universe || [], selectedAsset)
        const szDecimals = assetIndex !== -1 ? perpsMeta?.universe[assetIndex]?.szDecimals || 0 : 0

        let maxAllowedUsd = 0
        if (!isReduceOnly) {
          maxAllowedUsd = Number(clearingHouseState.withdrawable || 0) * leverage
        } else {
          const existingPosition = clearingHouseState.assetPositions.find((pos) => {
            return pos.position.coin === selectedAsset
          })
          if (existingPosition) {
            const szi = Number(existingPosition.position.szi)
            if (!((szi > 0 && !isBuy) || (szi < 0 && isBuy))) {
              const priceQuotient = price / Number(existingPosition.position.entryPx || 1)
              maxAllowedUsd = Number(existingPosition.position.positionValue || 0) * priceQuotient
            }
          }
        }
        maxAssetTradable = maxAllowedUsd / price
        if (Number.isNaN(maxAssetTradable)) maxAssetTradable = 0
        if (szDecimals && Number.isFinite(maxAssetTradable)) {
          maxAssetTradable = Number(maxAssetTradable.toFixed(szDecimals))
        }
      } else {
        maxAssetTradable = 0
      }
    } else {
      // Spot
      const assetName = spotKeyToName.get(selectedAsset) || ''
      const base = assetName.split('/')[0]
      if (spotState && base) {
        if (isBuy) {
          const usdcBal = Number(spotState.balances.find((b) => b.coin === 'USDC')?.total ?? 0)
          const usdcHold = Number(spotState.balances.find((b) => b.coin === 'USDC')?.hold ?? 0)
          const maxUsd = Math.max(usdcBal - usdcHold, 0)
          maxAssetTradable = maxUsd / price
        } else {
          const baseBal = Number(
            spotState.balances.find((b) => b.coin.split('/')[0] === base)?.total ?? 0
          )
          const baseHold = Number(
            spotState.balances.find((b) => b.coin.split('/')[0] === base)?.hold ?? 0
          )
          maxAssetTradable = Math.max(baseBal - baseHold, 0)
        }

        const szDecimals = spotMeta?.tokens.find((t) => t.name.includes(base))?.szDecimals || 0
        if (szDecimals && Number.isFinite(maxAssetTradable)) {
          maxAssetTradable = Number(maxAssetTradable.toFixed(szDecimals))
        }
      } else {
        maxAssetTradable = 0
      }
    }

    // Desired size from orderbook
    const desiredSz = Number(requestedAssetAmount || 0)
    const finalSz = Math.min(desiredSz, maxAssetTradable)

    // Apply values
    setLimitPrice(String(price))
    if (finalSz > 0) {
      setAssetAmount(String(finalSz))
      const nextUsd = finalSz * price
      if (!Number.isNaN(nextUsd)) setUsdAmount(String(nextUsd))
    }

    clearRequestedLimitPrice()
    clearRequestedAssetAmount()
  }, [
    requestedLimitPrice,
    requestedAssetAmount,
    isSpot,
    isReduceOnly,
    leverage,
    clearingHouseState,
    perpsMeta,
    spotState,
    selectedAsset
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
        <div className="flex flex-col items-start rounded-md align-middle gap-2 w-full">
          <div
            className={cn(
              'flex items-center justify-between gap-2 w-full',
              isRTL && 'flex-row-reverse'
            )}
          >
            <p className="font-medium text-white/70 text-xs whitespace-nowrap">
              {t('Limit price (USD)')}
            </p>
          </div>
          <SetPrice
            selectedAsset={selectedAsset}
            isRTL={isRTL}
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
            isRTL={isRTL}
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
            isRTL={isRTL}
          />
        )}
        <Separator orientation="horizontal" />

        <div
          className={cn(
            'flex items-center justify-center h-fit gap-1',
            isRTL && 'flex-row-reverse flex-wrap'
          )}
        >
          <Toggle
            size={'sm'}
            className="bg-white/10"
            pressed={isReduceOnly}
            onPressedChange={setIsReduceOnly}
          >
            {isReduceOnly ? <IconCheckbox className="size-3" /> : <IconSquare className="size-3" />}
            <p className="text-xs font-semibold">{t('Reduce Only')}</p>
            <IconInfoCircle className="size-3" />
          </Toggle>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'flex-2 text-xs',
                  tpsl.isTpsl ? 'bg-accent text-accent-foreground' : 'bg-white/10 text-white/70'
                )}
                size={'sm'}
              >
                {t('TP/SL')}
                <IconChevronDown className="size-3" />
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
          <Toggle
            size={'sm'}
            className={cn('bg-white/10', isRTL && 'w-full')}
            pressed={isPostOnly}
            onPressedChange={setIsPostOnly}
          >
            {isPostOnly ? <IconCheckbox className="size-3" /> : <IconSquare className="size-3" />}
            <p className="text-xs font-semibold">{t('Post Only')}</p>
            <IconInfoCircle className="size-3" />
          </Toggle>
        </div>
        <Separator orientation="horizontal" />
        <div className="flex w-full flex-col gap-2 text-xs">
          {!isSpot && (
            <>
              <div className={cn('flex justify-between', isRTL && 'flex-row-reverse')}>
                <p className="text-white/70">{t('Liquidation Price')}</p>
                <p className="text-white">{liquidationPrice()}</p>
              </div>

              <div className={cn('flex justify-between', isRTL && 'flex-row-reverse')}>
                <p className="text-white/70">{t('Margin Required')}</p>
                <p className="text-white">
                  ${((Number(assetAmount) * Number(limitPrice)) / leverage).toFixed(2)}
                </p>
              </div>
            </>
          )}
          <div className={cn('flex justify-between', isRTL && 'flex-row-reverse')}>
            <p className="text-white/70">{t('Order Value')}</p>
            <p className="text-white">${Number(usdAmount).toFixed(2)} </p>
          </div>
          <Fees isSpot={isSpot} isRTL={isRTL} />
        </div>
      </div>
      <div className="flex flex-col gap-2 h-fit w-full p-2">
        <Separator orientation="horizontal" />
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
    </div>
  )
}
export default LimitOrder
