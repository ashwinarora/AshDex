import { useEffect, useMemo, useState } from 'react'
import { IPlaceOrderProps } from '.'
import OrderButton from './components/OrderButton'
import LeverageMargin from './components/LeverageMargin'
import AmountInput from './components/AmountInput'
import BuyOrSell from './components/BuyOrSell'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import { IconCheckbox, IconInfoCircle, IconSquare } from '@tabler/icons-react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/lib/utils'
import { useTranslate } from '@tolgee/react'
import useIsSpot from '@/hooks/useIsSpot'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { MAX_DECIMALS_PERP, MAX_DECIMALS_SPOT } from '@/utils/constants'
import { getPerpsUniverseIndex } from '@/utils/utils'

const StopMarket = ({ selectedAsset, isRTL }: IPlaceOrderProps) => {
  const { t } = useTranslate()
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
  const [limitPrice, setLimitPrice] = useState('')
  const [priceInitialized, setPriceInitialized] = useState(false)

  const isSpot = useIsSpot()
  const { data: spotMeta } = useSpotMeta()

  const { perpsMeta } = useHyperliquidStore(
    useShallow((state) => ({
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
        <Input
          type="text"
          placeholder="0"
          value={stopPrice}
          onChange={(e) => setStopPrice(parseFloat(e.target.value) || 0)}
          className={cn(
            'w-full text-end shrink-0 text-white placeholder:text-white',
            isRTL && 'text-start'
          )}
        />
        <Separator orientation="horizontal" />
        <AmountInput
          selectedAsset={selectedAsset}
          assetAmount={assetAmount}
          setAssetAmount={setAssetAmount}
          usdAmount={usdAmount}
          setUsdAmount={setUsdAmount}
          limitPrice={limitPrice || allMids[selectedAsset]?.toString() || ''}
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
          limitPrice={limitPrice || allMids[selectedAsset]?.toString() || ''}
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
