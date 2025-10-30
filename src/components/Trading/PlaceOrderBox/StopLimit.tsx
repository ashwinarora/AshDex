import React, { useEffect, useMemo, useState } from 'react'
import { IPlaceOrderProps } from '.'
import OrderButton from './components/OrderButton'
import LeverageMargin from './components/LeverageMargin'
import AmountInput from './components/AmountInput'
import BuyOrSell from './components/BuyOrSell'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { IconCheckbox, IconInfoCircle, IconRefresh, IconSquare } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useTranslate } from '@tolgee/react'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import useIsSpot from '@/hooks/useIsSpot'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { MAX_DECIMALS_PERP, MAX_DECIMALS_SPOT } from '@/utils/constants'
import { getPerpsUniverseIndex } from '@/utils/utils'

const StopLimit = ({ selectedAsset, isRTL }: IPlaceOrderProps) => {
  const { t } = useTranslate()
  const [stopPrice, setStopPrice] = useState(0)
  const [limitPrice, setLimitPrice] = useState('')
  const [isReduceOnly, setIsReduceOnly] = useState(false)
  const [isBuy, setIsBuy] = useState(true)
  const [assetAmount, setAssetAmount] = useState<string>('')
  const [usdAmount, setUsdAmount] = useState<string>('')
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)
  const [priceInitialized, setPriceInitialized] = useState(false)

  const isSpot = useIsSpot()
  const { data: spotMeta } = useSpotMeta()
  const { allMids, perpsMeta } = useHyperliquidStore(
    useShallow((state) => ({
      allMids: state.allMids,
      perpsMeta: state.perpsMeta
    }))
  )

  const szDecimals = useMemo(() => {
    if (isSpot) {
      const tokenData = spotMeta?.tokens.find((token) => token.name.includes(selectedAsset))
      return tokenData?.szDecimals || 0
    } else {
      const assetIndex = getPerpsUniverseIndex(perpsMeta?.universe || [], selectedAsset)
      if (assetIndex === -1) return 0
      return perpsMeta?.universe[assetIndex].szDecimals || 0
    }
  }, [perpsMeta, selectedAsset, isSpot, spotMeta])

  const getFormattedPrice = () => {
    const maxDecimals = isSpot ? MAX_DECIMALS_SPOT : MAX_DECIMALS_PERP
    const allowedDecimals = maxDecimals - szDecimals
    const rawPrice = allMids[selectedAsset]?.toString()
    if (!rawPrice) return ''

    const [intPart, decPart] = rawPrice.split('.')
    const intSigFigs = intPart.replace(/^0+/, '').length
    if (intSigFigs >= 5) {
      return intPart
    }
    if (!decPart) {
      return intPart
    }
    const totalSigFigs = intSigFigs + decPart.length
    if (totalSigFigs > 5) {
      const truncateLength = 5 - intSigFigs
      if (truncateLength > 0) {
        return `${intPart}.${decPart.slice(0, truncateLength)}`
      }
      return intPart
    }
    const maxAllowedDecimals = Math.min(allowedDecimals, decPart.length)
    return `${intPart}.${decPart.slice(0, maxAllowedDecimals)}`
  }

  useEffect(() => {
    if (priceInitialized) setPriceInitialized(false)
  }, [selectedAsset])

  useEffect(() => {
    if (allMids[selectedAsset] && !limitPrice && !priceInitialized) {
      const formattedPrice = getFormattedPrice()
      setLimitPrice(formattedPrice)
      setPriceInitialized(true)
    }
  }, [allMids, selectedAsset])

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setLimitPrice(input)
    const numValue = parseFloat(input) || 0
    setUsdAmount((numValue * parseFloat(assetAmount)).toString())
  }

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
        <LeverageMargin
          selectedAsset={selectedAsset}
          leverage={leverage}
          setLeverage={setLeverage}
          isRTL={isRTL}
        />
        <Separator orientation="horizontal" />
        <label htmlFor="stopPrice" className={cn('text-xs text-white/70', isRTL && 'text-end')}>
          {t('Stop Price')}
        </label>
        <div className={cn('flex w-full gap-3 items-center', isRTL && 'flex-row-reverse')}>
          <Input
            type="text"
            placeholder="0"
            value={stopPrice}
            onChange={(e) => setStopPrice(parseFloat(e.target.value) || 0)}
            className={cn(
              'w-full flex-1 text-end text-white placeholder:text-white',
              isRTL && 'text-start'
            )}
          />
          <Button
            variant="outline"
            size={'sm'}
            className="text-xs w-16 bg-transparent hover:bg-transparent"
            disabled={true}
          >
            <IconRefresh className="size-3" />
            {t('Last')}
          </Button>
        </div>
        <label htmlFor="limitPrice" className={cn('text-xs text-white/70', isRTL && 'text-end')}>
          {t('Limit Price')}
        </label>
        <div className={cn('flex w-full gap-3 items-center', isRTL && 'flex-row-reverse')}>
          <Input
            type="text"
            placeholder="0"
            value={limitPrice}
            onChange={(e) => handleLimitPriceChange(e)}
            className={cn(
              'w-full flex-1 text-end text-white placeholder:text-white',
              isRTL && 'text-start'
            )}
          />
          <Button variant={'outline'} size={'sm'} className="text-xs w-16" disabled>
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
          isRTL={isRTL}
        />
        <Separator orientation="horizontal" />
        <div
          className={cn(
            'flex items-start w-full justify-start h-full gap-1',
            isRTL && 'flex-row-reverse'
          )}
        >
          <Toggle
            size={'sm'}
            className={cn('bg-white/10 w-full', isRTL && 'flex-row-reverse')}
            pressed={isReduceOnly}
            onPressedChange={setIsReduceOnly}
          >
            {isReduceOnly ? <IconCheckbox className="size-3" /> : <IconSquare className="size-3" />}
            <p className="text-xs font-semibold">{t('Reduce Only')}</p>
            <IconInfoCircle className="size-3" />
          </Toggle>
        </div>
      </div>
      <div className={cn('flex flex-col gap-2 h-fit w-full p-2')}>
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
