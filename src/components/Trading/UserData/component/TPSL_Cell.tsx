import React, { useMemo, useState } from 'react'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { IconChevronDown } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { ApiRequestError, AssetPosition } from '@nktkas/hyperliquid'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { BUILDER_ADDRESS } from '@/utils/constants'
import { toast } from 'sonner'
import { getFormattedPrice, getPerpsUniverseIndex } from '@/utils/utils'
import { OrderData } from '@/utils/hyperliquid/PlaceOrder'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useUserFee } from '@/hooks/useUserFee'
import { useTranslate } from '@tolgee/react'
import useUserStore from '@/store/userStore'

interface TPSLCellProps {
  asset: string
  tpslAsset: AssetPosition['position']
  isOpen: boolean
  onClose: () => void
}

function calculatePnL(
  position: AssetPosition['position'],
  triggerPrice: number
): { profitPercentage: number; profitAmount: number } {
  const {
    entryPx,
    leverage: { value: lev },
    marginUsed
  } = position

  const delta = Number(triggerPrice) - Number(entryPx)
  const profitPercentage = (delta / Number(entryPx)) * Number(lev)
  const profitAmount = Number(marginUsed) * profitPercentage

  return {
    profitPercentage: Number((profitPercentage * 100).toFixed(2)),
    profitAmount: Number(profitAmount.toFixed(2))
  }
}

function calculateTriggerFromPercentage(
  position: AssetPosition['position'],
  profitPercentage: number
): { triggerPrice: number; profitAmount: number } {
  const {
    entryPx,
    leverage: { value: lev },
    marginUsed
  } = position

  const deltaPrice = (Number(profitPercentage) * Number(entryPx)) / Number(lev)
  const triggerPrice = Number(entryPx) + Number(deltaPrice)
  const profitAmount = Number(marginUsed) * Number(profitPercentage)

  return { triggerPrice, profitAmount }
}

function calculateTriggerFromAmount(
  position: AssetPosition['position'],
  profitAmount: number
): { triggerPrice: number; profitPercentage: number } {
  const entryPx = position.entryPx
  const positionSize = Number(position.szi)
  const deltaPrice = profitAmount / positionSize
  const triggerPrice = Number(entryPx) + Number(deltaPrice)
  const profitPercentage = (Number(deltaPrice) / Number(entryPx)) * 100
  return {
    triggerPrice: Number(triggerPrice.toFixed(4)),
    profitPercentage: Number(profitPercentage.toFixed(2))
  }
}

const TPSL_Cell: React.FC<TPSLCellProps> = ({
  asset,
  tpslAsset,
  isOpen,
  onClose
}: TPSLCellProps) => {
  const { t } = useTranslate()
  const [tpTriggerPrice, setTpTriggerPrice] = useState('')
  const [slTriggerPrice, setSlTriggerPrice] = useState('')
  const [tpValue, setTpValue] = useState('')
  const [slValue, setSlValue] = useState('')
  const [tpPercent, setTpPercent] = useState('')
  const [slPercent, setSlPercent] = useState('')
  const [tpMode, setTpMode] = useState<'$' | '%'>('%')
  const [slMode, setSlMode] = useState<'$' | '%'>('%')
  const [configureAmount, setConfigureAmount] = useState(false)
  const [amount, setAmount] = useState('')
  const [limitPrice, setLimitPrice] = useState(false)
  const [tpLimitPrice, setTpLimitPrice] = useState('')
  const [slLimitPrice, setSlLimitPrice] = useState('')
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')

  const { perpAssetContext, agentWallet, perpsMeta, sdkL1ActionClient } = useHyperliquidStore(
    useShallow((state) => ({
      perpAssetContext: state.perpAssetContext,
      agentWallet: state.agentWallet,
      perpsMeta: state.perpsMeta,
      sdkL1ActionClient: state.sdkL1ActionClient
    }))
  )
  const { getAdjustedBuilderFee } = useUserFee()

  const assetCtx = useMemo(() => {
    const assetIndex = perpsMeta?.universe.findIndex((item) => item.name === tpslAsset.coin)
    return assetIndex ? perpAssetContext[assetIndex] : null
  }, [perpAssetContext, tpslAsset.coin, perpsMeta])

  const entryPrice = Number(tpslAsset.entryPx)
  const markPrice = Number(assetCtx?.markPx)
  const position = Number(tpslAsset.szi)

  const handleTpPriceChange = (value: string) => {
    setTpTriggerPrice(value)
    if (value) {
      const { profitPercentage, profitAmount } = calculatePnL(tpslAsset, Number(value))
      setTpPercent(profitPercentage.toString())
      setTpValue(profitAmount.toString())
    }
  }

  const handleSlPriceChange = (value: string) => {
    setSlTriggerPrice(value)
    if (value) {
      const { profitPercentage, profitAmount } = calculatePnL(tpslAsset, Number(value))
      setSlPercent(profitPercentage.toString())
      setSlValue(profitAmount.toString())
    }
  }

  const handleTpValueChange = (value: string) => {
    if (tpMode === '%') {
      setTpPercent(value)
      if (value) {
        const { triggerPrice, profitAmount } = calculateTriggerFromPercentage(
          tpslAsset,
          Number(value) / 100
        )
        setTpValue(profitAmount.toString())
        setTpTriggerPrice(triggerPrice.toString())
      }
    } else {
      setTpValue(value)
      if (value) {
        const numValue = Number(value)
        const { triggerPrice, profitPercentage } = calculateTriggerFromAmount(tpslAsset, numValue)
        setTpPercent(profitPercentage.toString())
        setTpTriggerPrice(triggerPrice.toString())
      }
    }
  }

  const handleSlValueChange = (value: string) => {
    if (slMode === '%') {
      setSlPercent(value)
      if (value) {
        const { triggerPrice, profitAmount } = calculateTriggerFromPercentage(
          tpslAsset,
          -Number(value) / 100
        )
        setSlValue(profitAmount.toString())
        setSlTriggerPrice(triggerPrice.toString())
      }
    } else {
      setSlValue(value)
      if (value) {
        const numValue = Number(value)
        const { triggerPrice, profitPercentage } = calculateTriggerFromAmount(tpslAsset, -numValue)
        setSlPercent(profitPercentage.toString())
        setSlTriggerPrice(triggerPrice.toString())
      }
    }
  }

  const handleTpModeChange = (mode: '$' | '%') => {
    setTpMode(mode)
    if (tpTriggerPrice) {
      const { profitPercentage, profitAmount } = calculatePnL(tpslAsset, Number(tpTriggerPrice))
      setTpPercent(profitPercentage.toString())
      setTpValue(profitAmount.toString())
    }
  }

  const handleSlModeChange = (mode: '$' | '%') => {
    setSlMode(mode)
    if (slTriggerPrice) {
      const { profitPercentage, profitAmount } = calculatePnL(tpslAsset, Number(slTriggerPrice))
      setSlPercent(profitPercentage.toString())
      setSlValue(profitAmount.toString())
    }
  }

  const handleClick = async () => {
    if (!agentWallet) return
    if (!perpsMeta) return
    if (!sdkL1ActionClient) return
    const orders: OrderData[] = []
    const assetIndex = getPerpsUniverseIndex(perpsMeta.universe, tpslAsset.coin)
    const isBuyPosition = Number(tpslAsset.szi) > 0
    if (tpTriggerPrice) {
      const multiplier = isBuyPosition ? 0.92 : 1.08
      const price = tpLimitPrice ? tpLimitPrice : (Number(tpTriggerPrice) * multiplier).toString()
      const isMarket = tpLimitPrice ? false : true
      const formattedTriggerPrice = getFormattedPrice({
        price: Number(tpTriggerPrice),
        isSpot: false,
        szDecimals: perpsMeta.universe[assetIndex].szDecimals
      })
      const formattedPrice = getFormattedPrice({
        price: Number(price),
        isSpot: false,
        szDecimals: perpsMeta.universe[assetIndex].szDecimals
      })
      orders.push({
        assetIndex,
        isBuy: !isBuyPosition,
        price: formattedPrice,
        size: Number(amount).toString(),
        reduceOnly: true,
        orderType: {
          trigger: {
            isMarket,
            triggerPx: formattedTriggerPrice,
            tpsl: 'tp'
          }
        }
      })
    }
    if (slTriggerPrice) {
      const multiplier = isBuyPosition ? 0.92 : 1.08
      const price = slLimitPrice ? slLimitPrice : (Number(slTriggerPrice) * multiplier).toString()
      const isMarket = slLimitPrice ? false : true
      const formattedSlTriggerPrice = getFormattedPrice({
        price: Number(slTriggerPrice),
        isSpot: false,
        szDecimals: perpsMeta.universe[assetIndex].szDecimals
      })
      const formattedPrice = getFormattedPrice({
        price: Number(price),
        isSpot: false,
        szDecimals: perpsMeta.universe[assetIndex].szDecimals
      })
      orders.push({
        assetIndex,
        isBuy: !isBuyPosition,
        price: formattedPrice,
        size: Number(amount).toString(),
        reduceOnly: true,
        orderType: {
          trigger: {
            isMarket,
            triggerPx: formattedSlTriggerPrice,
            tpsl: 'sl'
          }
        }
      })
    }
    const toastId = toast.loading('Placing TP/SL order...')
    try {
      const adjustedBuilderFee = getAdjustedBuilderFee()
      const res = await sdkL1ActionClient.order({
        grouping: 'positionTpsl',
        builder: {
          b: BUILDER_ADDRESS,
          f: adjustedBuilderFee
        },
        orders: orders.map((order) => ({
          a: order.assetIndex,
          b: order.isBuy,
          p: order.price,
          s: order.size,
          r: order.reduceOnly,
          t: order.orderType
        }))
      })
      console.log(res)
      onClose()
      toast.success('TP/SL order placed successfully', {
        id: toastId
      })
    } catch (error) {
      console.error(error)
      onClose()
      if (error instanceof ApiRequestError) {
        toast.error(error.message, {
          id: toastId
        })
      } else {
        toast.error('Failed to place TP/SL order.', {
          id: toastId
        })
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col gap-4 min-w-4/5 md:min-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t('TP/SL for')} {tpslAsset.coin}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div
            className={cn(
              'flex w-full items-center justify-between gap-1',
              isRTL && 'flex-row-reverse'
            )}
          >
            <span className="text-xs text-white/50">{t('Coin')}</span>
            <span className="text-xs text-white">{asset}</span>
          </div>
          <div
            className={cn(
              'flex w-full items-center justify-between gap-1',
              isRTL && 'flex-row-reverse'
            )}
          >
            <span className="text-xs text-white/50">{t('Position')}</span>
            <span className="text-xs text-white">
              {position} {asset}
            </span>
          </div>
          <div
            className={cn(
              'flex w-full items-center justify-between gap-1',
              isRTL && 'flex-row-reverse'
            )}
          >
            <span className="text-xs text-white/50">{t('Entry Price')}</span>
            <span className="text-xs text-white">{entryPrice.toLocaleString()}</span>
          </div>
          <div
            className={cn(
              'flex w-full items-center justify-between gap-1',
              isRTL && 'flex-row-reverse'
            )}
          >
            <span className="text-xs text-white/50">{t('Mark Price')}</span>
            <span className="text-xs text-white">{markPrice.toLocaleString()}</span>
          </div>
        </div>
        <Separator orientation="horizontal" />
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col w-full items-start gap-2">
            <div className="flex items-center w-full justify-between gap-2">
              <span
                className={cn(
                  'flex-1 text-start text-nowrap font-medium text-white text-xs',
                  isRTL && 'text-end'
                )}
              >
                {t('TP Price')}
              </span>
            </div>
            <div className={cn('flex items-center gap-2 w-full', isRTL && 'flex-row-reverse')}>
              <Input
                value={tpTriggerPrice}
                onChange={(e) => handleTpPriceChange(e.target.value)}
                type="number"
                inputMode="decimal"
                className={cn('text-white text-sm text-end flex-1', isRTL && 'text-end')}
                placeholder="0.00"
              />
              <Input
                value={tpMode === '%' ? tpPercent : tpValue}
                onChange={(e) => handleTpValueChange(e.target.value)}
                type="number"
                className={cn('text-white text-sm text-end flex-1', isRTL && 'text-end')}
                placeholder="0.00"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={'outline'}
                    size={'sm'}
                    className={cn(
                      'min-w-28 !p-2 !h-fit flex items-center justify-between gap-1 w-fit'
                    )}
                  >
                    <span className="text-xs ">{tpMode === '%' ? t('TP %') : t('TP $')}</span>
                    <IconChevronDown className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-28" align="end">
                  <DropdownMenuItem onClick={() => handleTpModeChange('$')}>$</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTpModeChange('%')}>%</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className={cn('text-xs text-white/50 mb-2', isRTL && 'text-end')}>
            {t('Expected profit:')}{' '}
            {tpTriggerPrice
              ? tpMode === '%'
                ? `${((Number(tpTriggerPrice) - entryPrice) * position).toFixed(2)} $`
                : `${Number(tpPercent).toFixed(2)}%`
              : '0.00'}
          </div>
          <div className="flex flex-col w-full items-start gap-2">
            <div className="flex items-center w-full justify-between gap-2">
              <span
                className={cn(
                  'flex-1 text-start text-nowrap font-medium text-white text-xs',
                  isRTL && 'text-end'
                )}
              >
                {t('SL Value')}
              </span>
            </div>
            <div className={cn('flex items-center gap-2 w-full', isRTL && 'flex-row-reverse')}>
              <Input
                value={slTriggerPrice}
                onChange={(e) => handleSlPriceChange(e.target.value)}
                type="number"
                inputMode="decimal"
                className={cn('text-white text-sm text-end flex-1', isRTL && 'text-end')}
                placeholder="0.00"
              />
              <Input
                value={slMode === '%' ? slPercent : slValue}
                onChange={(e) => handleSlValueChange(e.target.value)}
                type="number"
                className={cn('text-white text-sm text-end flex-1', isRTL && 'text-end')}
                placeholder="0.00"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={'outline'}
                    size={'sm'}
                    className={cn(
                      'min-w-28 !p-2 !h-fit flex items-center justify-between gap-1 w-fit'
                    )}
                  >
                    <span className="text-xs text-white/50">
                      {slMode === '%' ? t('SL %') : t('SL $')}
                    </span>
                    <IconChevronDown className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-28" align="end">
                  <DropdownMenuItem onClick={() => handleSlModeChange('$')}>$</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSlModeChange('%')}>%</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className={cn('text-xs text-white/50 mb-2', isRTL && 'text-end')}>
            {t('Expected loss:')}{' '}
            {slTriggerPrice
              ? slMode === '%'
                ? `${((entryPrice - Number(slTriggerPrice)) * position).toFixed(2)} $`
                : `${Number(slPercent).toFixed(2)}%`
              : '0.00'}
          </div>
        </div>
        <Separator orientation="horizontal" />
        <div className="flex flex-col gap-2">
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <span className="text-xs text-white/50">{t('Configure Amount')}</span>
            <Switch
              checked={configureAmount}
              onCheckedChange={() => setConfigureAmount(!configureAmount)}
            />
          </div>
          <div className={cn('flex items-center gap-2 w-full', isRTL && 'flex-row-reverse')}>
            <Slider
              min={0}
              max={Math.abs(position)}
              disabled={!configureAmount}
              step={Math.abs(position) / 100}
              dir={isRTL ? 'rtl' : 'ltr'}
              value={[Number(amount)]}
              onValueChange={(value) => setAmount(value[0].toString())}
              className="w-full"
            />
            <Input
              value={amount.toLocaleString()}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={!configureAmount}
              className="w-20 text-end"
              type="number"
              inputMode="decimal"
            />
            <span className={cn('text-xs text-white', !configureAmount && 'opacity-50')}>
              {tpslAsset.coin}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <span className="text-xs text-white/50">{t('Limit Price')}</span>
            <Switch checked={limitPrice} onCheckedChange={() => setLimitPrice(!limitPrice)} />
          </div>
          <div className={cn('flex items-center gap-2 w-full', isRTL && 'flex-row-reverse')}>
            <Input
              className={cn('w-full text-start', isRTL && 'text-end')}
              disabled={!limitPrice}
              value={tpLimitPrice}
              onChange={(e) => setTpLimitPrice(e.target.value)}
              placeholder={t('TP Limit Price')}
              type="number"
            />
            <Input
              className={cn('w-full text-end', isRTL && 'text-start')}
              disabled={!limitPrice}
              value={slLimitPrice}
              onChange={(e) => setSlLimitPrice(e.target.value)}
              placeholder={t('SL Limit Price')}
              type="number"
            />
          </div>
        </div>
        <Separator orientation="horizontal" />
        <Button onClick={handleClick}>{t('Confirm')}</Button>
        <DialogFooter className="text-xs text-white/50 text-center">
          {t(
            'Note: By default take-profit and stop-loss orders apply to the entire position. Take-profit and stop-loss automatically cancel after closing the position. A market order is triggered when the stop loss or take profit price is reached. If the order size is configured above, the TP/SL order will be for that size no matter how the position changes in the future.'
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TPSL_Cell
