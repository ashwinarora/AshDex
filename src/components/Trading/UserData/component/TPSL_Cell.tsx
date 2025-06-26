import React, { useMemo, useState } from 'react'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { IconChevronDown } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useAgentApproval } from '@/context/EstablishConnection'
import { AssetPosition } from '@nktkas/hyperliquid'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { BUILDER_ADDRESS, isTestnet } from '@/utils/constants'
import { toast } from 'react-toastify'
import { getFormattedPrice, getPerpsUniverseIndex } from '@/utils/utils'
import { OrderData, placeOrder } from '@/utils/hyperliquid/PlaceOrder'
import { hyperliquidAxios } from '@/config/axios'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

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


const TPSL_Cell: React.FC<TPSLCellProps> = ({ asset, tpslAsset, isOpen, onClose }: TPSLCellProps) => {
  // const { openOrders } = useHyperliquid()
  const { currentFeeApproval } = useAgentApproval()


  // const triggerPrices = useMemo(() => {
  //   const assetOrders = openOrders.filter((order) => order.coin === asset)
  //   const tpOrder = assetOrders.find((order) => order.orderType === 'Take Profit Limit')
  //   const slOrder = assetOrders.find((order) => order.orderType === 'Stop Limit')
  //   return {
  //     tp: tpOrder?.triggerPx,
  //     sl: slOrder?.triggerPx
  //   }
  // }, [openOrders, asset])

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

  const { perpAssetContext, agentWallet, perpsMeta } = useHyperliquid()

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
    const orders: OrderData[] = []
    const assetIndex = getPerpsUniverseIndex(perpsMeta.universe, tpslAsset.coin)
    const isBuy = !(Number(tpslAsset.szi) > 0)
    if (tpTriggerPrice) {
      const multiplier = isBuy ? 1.1 : 0.9
      const price = tpLimitPrice
        ? tpLimitPrice
        : (Number(tpTriggerPrice) * multiplier).toString()
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
        isBuy,
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
      const multiplier = isBuy ? 0.9 : 1.1
      const price = slLimitPrice
        ? slLimitPrice
        : (Number(slTriggerPrice) * multiplier).toString()
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
        isBuy,
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
      const res = await placeOrder(agentWallet, isTestnet, hyperliquidAxios, {
        orders: orders,
        grouping: 'positionTpsl',
        builder: {
          address: BUILDER_ADDRESS,
          fee: currentFeeApproval
        }
      })
      console.log(res)
      toast.update(toastId, {
        render: '✅ TP/SL order placed successfully',
        type: 'success',
        isLoading: false,
        autoClose: 2000
      })
    } catch (error) {
      console.error(error)
      toast.update(toastId, {
        render: '❌ ' + error,
        type: 'error',
        isLoading: false,
        autoClose: 2000
      })
    }

  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* <DialogTrigger asChild>
        <button className={cn(
          "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          "w-full flex items-center justify-between gap-1"
          )}>
          {'Set TP/SL'}
          <IconPencil className="size-3 text-inherit" />
        </button>
      </DialogTrigger> */}
      <DialogContent className='flex flex-col gap-4'>
        <DialogHeader>
          <DialogTitle>
            TP/SL for {tpslAsset.coin}
          </DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-2'>
          <div className='flex w-full items-center justify-between gap-1'>
            <span className='text-xs text-white/50'>Coin</span>
            <span className='text-xs text-white'>{asset}</span>
          </div>
          <div className='flex w-full items-center justify-between gap-1'>
            <span className='text-xs text-white/50'>Position</span>
            <span className='text-xs text-white'>{position} {asset}</span>
          </div>
          <div className='flex w-full items-center justify-between gap-1'>
            <span className='text-xs text-white/50'>Entry Price</span>
            <span className='text-xs text-white'>{entryPrice.toLocaleString()}</span>
          </div>
          <div className='flex w-full items-center justify-between gap-1'>
            <span className='text-xs text-white/50'>Mark Price</span>
            <span className='text-xs text-white'>{markPrice.toLocaleString()}</span>
          </div>
        </div>
        <Separator orientation='horizontal' />
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col w-full items-start gap-2">
            <div className="flex items-center w-full justify-between gap-2">
              <span className="flex-1 text-left text-nowrap font-medium text-white text-xs">
                TP Price
              </span>
            </div>
            <div className="flex items-center gap-2 w-full">
              <Input
                value={tpTriggerPrice}
                onChange={(e) => handleTpPriceChange(e.target.value)}
                type="number"
                inputMode="decimal"
                className="text-white text-sm text-right flex-1"
                placeholder="0.00"
              />
              <Input
                value={tpMode === '%' ? tpPercent : tpValue}
                onChange={(e) => handleTpValueChange(e.target.value)}
                type="number"
                className="text-white text-sm text-right flex-1"
                placeholder="0.00"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={'outline'} size={'sm'} className='w-20 !p-2 !h-fit flex items-center justify-between gap-1'>
                    <span className='text-xs text-white/50'>{tpMode === '%' ? 'TP %' : 'TP $'}</span>
                    <IconChevronDown className='size-3' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-20' align='end'>
                  <DropdownMenuItem onClick={() => handleTpModeChange('$')}>$</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTpModeChange('%')}>%</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="text-xs text-white/50 mb-2">
            Expected profit:{' '}
            {tpTriggerPrice
              ? tpMode === '%'
                ? `${((Number(tpTriggerPrice) - entryPrice) * position).toFixed(2)} $`
                : `${Number(tpPercent).toFixed(2)}%`
              : '0.00'}
          </div>
          <div className="flex flex-col w-full items-start gap-2">
            <div className="flex items-center w-full justify-between gap-2">
              <span className="flex-1 text-left text-nowrap font-medium text-white text-xs">
                SL Value
              </span>
            </div>
            <div className="flex items-center gap-2 w-full">
              <Input
                value={slTriggerPrice}
                onChange={(e) => handleSlPriceChange(e.target.value)}
                type="number"
                inputMode="decimal"
                className="text-white text-sm text-right flex-1"
                placeholder="0.00"
              />
              <Input
                value={slMode === '%' ? slPercent : slValue}
                onChange={(e) => handleSlValueChange(e.target.value)}
                type="number"
                className="text-white text-sm text-right flex-1"
                placeholder="0.00"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={'outline'} size={'sm'} className='w-20 !p-2 !h-fit flex items-center justify-between gap-1'>
                    <span className='text-xs text-white/50'>{slMode === '%' ? 'SL %' : 'SL $'}</span>
                    <IconChevronDown className='size-3' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-20' align='end'>
                  <DropdownMenuItem onClick={() => handleSlModeChange('$')}>$</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSlModeChange('%')}>%</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="text-xs text-white/50 mb-2">
            Expected loss:{' '}
            {slTriggerPrice
              ? slMode === '%'
                ? `${((entryPrice - Number(slTriggerPrice)) * position).toFixed(2)} $`
                : `${Number(slPercent).toFixed(2)}%`
              : '0.00'}
          </div>
        </div>
        <Separator orientation='horizontal' />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">Configure Amount</span>
            <Switch
              checked={configureAmount}
              onCheckedChange={() => setConfigureAmount(!configureAmount)}
            />
          </div>
          <div className="flex items-center gap-2 w-full">
            <Slider
              min={0}
              max={Math.abs(position)}
              disabled={!configureAmount}
              step={Math.abs(position) / 100}
              value={[Number(amount)]}
              onValueChange={(value) => setAmount(value[0].toString())}
              className='w-full'
            />
            <Input
              value={amount.toLocaleString()}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={!configureAmount}
              className='w-20 text-right'
              type='number'
              inputMode='decimal'
            />
            <span className={cn("text-xs text-white", !configureAmount && "opacity-50")}>{tpslAsset.coin}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">Limit Price</span>
            <Switch
              checked={limitPrice}
              onCheckedChange={() => setLimitPrice(!limitPrice)}
            />
          </div>
          <div className="flex items-center gap-2 w-full">
            <Input
              className="w-full text-left"
              disabled={!limitPrice}
              value={tpLimitPrice}
              onChange={(e) => setTpLimitPrice(e.target.value)}
              placeholder="TP Limit Price"
              type="number"
            />
            <Input
              className="w-full text-right"
              disabled={!limitPrice}
              value={slLimitPrice}
              onChange={(e) => setSlLimitPrice(e.target.value)}
              placeholder="SL Limit Price"
              type="number"
            />
          </div>
        </div>
        <Separator orientation='horizontal' />
        <Button onClick={handleClick}>Confirm</Button>
        <DialogFooter className='text-xs text-white/50 text-center'>
          Note: By default take-profit and stop-loss orders apply to the entire position. Take-profit and
          stop-loss automatically cancel after closing the position. A market order is triggered
          when the stop loss or take profit price is reached. If the order size is configured above, the TP/SL order will be for that size no matter how the position changes in the future.
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TPSL_Cell
