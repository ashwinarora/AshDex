import { useMemo, useState } from 'react'
import BuyOrSell from './components/BuyOrSell'
import { OrderData } from '@/utils/hyperliquid/PlaceOrder'
import { getPerpsUniverseIndex } from '@/utils/utils'
import { cn } from '@/lib/utils'
import { BUILDER_ADDRESS } from '@/utils/constants'

import { IPlaceOrderProps } from '.'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import LeverageMargin from './components/LeverageMargin'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  IconCheckbox,
  // IconRefresh,
  IconSquare,
  IconInfoCircle,
  IconChevronDown,
  IconMinus,
  IconPlus,
  IconPercentage
} from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Toggle } from '@/components/ui/toggle'
import { PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Popover } from '@/components/ui/popover'
import { useShallow } from 'zustand/react/shallow'
import { useUserFee } from '@/hooks/useUserFee'
import { useTranslate } from '@tolgee/react'
import { getMaxAllowedLeverageForNotional } from './components/placePerpOrder'
interface Order {
  price: number
  size: number
}

function calculateScaleOrdersByUsd(
  totalUSD: number,
  startPrice: number,
  endPrice: number,
  totalOrders: number,
  skew: number
): Order[] {
  const orders: Order[] = []
  if (totalOrders === 1) {
    orders.push({ price: startPrice, size: totalUSD / startPrice })
    return orders
  }
  const prices: number[] = []
  for (let i = 0; i < totalOrders; i++) {
    const price = startPrice + (i * (endPrice - startPrice)) / (totalOrders - 1)
    prices.push(price)
  }
  const adjustedSkew = skew * (endPrice / startPrice)
  const weights: number[] = []
  for (let i = 0; i < totalOrders; i++) {
    const weight = 1 + (i * (adjustedSkew - 1)) / (totalOrders - 1)
    weights.push(weight)
  }
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  for (let i = 0; i < totalOrders; i++) {
    const allocationUSD = totalUSD * (weights[i] / totalWeight)
    const assetSize = allocationUSD / prices[i]
    orders.push({ price: prices[i], size: assetSize })
  }
  return orders
}

function calculateScaleOrdersByAssetSize(
  totalAssetSize: number,
  startPrice: number,
  endPrice: number,
  totalOrders: number,
  skew: number
): Order[] {
  const orders: Order[] = []
  if (totalOrders === 1) {
    orders.push({ price: startPrice, size: totalAssetSize })
    return orders
  }
  const prices: number[] = []
  for (let i = 0; i < totalOrders; i++) {
    const price = startPrice + (i * (endPrice - startPrice)) / (totalOrders - 1)
    prices.push(price)
  }
  const adjustedSkew = skew * (endPrice / startPrice)
  const weights: number[] = []
  for (let i = 0; i < totalOrders; i++) {
    const weight = 1 + (i * (adjustedSkew - 1)) / (totalOrders - 1)
    weights.push(weight)
  }
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  for (let i = 0; i < totalOrders; i++) {
    const allocationSize = totalAssetSize * (weights[i] / totalWeight)
    orders.push({
      price: prices[i],
      size: allocationSize
    })
  }
  return orders
}

const Scale = ({ selectedAsset, isRTL }: IPlaceOrderProps) => {
  const { agentWallet, clearingHouseState, allMids, perpsMeta, sdkL1ActionClient } =
    useHyperliquidStore(
      useShallow((state) => ({
        agentWallet: state.agentWallet,
        clearingHouseState: state.clearingHouseState,
        allMids: state.allMids,
        perpsMeta: state.perpsMeta,
        sdkL1ActionClient: state.sdkL1ActionClient
      }))
    )
  const { t } = useTranslate()
  const [totalUsd, setTotalUsd] = useState<number>()
  const [totalAssetSize, setTotalAssetSize] = useState<number>()
  const [startPrice, setStartPrice] = useState<number>()
  const [endPrice, setEndPrice] = useState<number>()
  const [totalOrders, setTotalOrders] = useState<number>(2)
  const [sizeSkew, setSizeSkew] = useState<number>(1)
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [isReduceOnly, setIsReduceOnly] = useState<boolean>(false)
  const [percent, setPercent] = useState(0)
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)
  const [isInputUsd, setIsInputUsd] = useState<boolean>(true)

  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()
  const { getAdjustedBuilderFee } = useUserFee()

  const maxAllowedUsd = useMemo(() => {
    if (!clearingHouseState) return 0
    if (!isReduceOnly) return Number(clearingHouseState.withdrawable) * leverage
    const existingPosition = clearingHouseState.assetPositions.find((pos) => {
      return pos.position.coin === selectedAsset
    })
    if (!existingPosition) return 0
    if (Number(existingPosition.position.szi) > 0 && isBuy) return 0
    if (Number(existingPosition.position.szi) < 0 && !isBuy) return 0
    const priceQuotient = Number(allMids[selectedAsset]) / Number(existingPosition.position.entryPx)
    const maxAllowedUsd = Number(existingPosition.position.positionValue) * priceQuotient
    return maxAllowedUsd
  }, [isReduceOnly, clearingHouseState, selectedAsset, isBuy, allMids, leverage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!perpsMeta) return
    if (!agentWallet) return
    if (!currentFeeApproval) return
    if (!totalUsd || !totalAssetSize) return
    const orders = calculateScaleOrdersByUsd(
      totalUsd!,
      startPrice!,
      endPrice!,
      totalOrders!,
      sizeSkew!
    )
    const usdOrders = calculateScaleOrdersByUsd(
      totalUsd!,
      startPrice!,
      endPrice!,
      totalOrders!,
      sizeSkew!
    )
    const assetOrders = calculateScaleOrdersByAssetSize(
      totalAssetSize!,
      startPrice!,
      endPrice!,
      totalOrders!,
      sizeSkew!
    )
    console.log({ usdOrders, assetOrders })
    const assetIndex = getPerpsUniverseIndex(perpsMeta.universe, selectedAsset)
    const assetUniverse = perpsMeta.universe[assetIndex]
    const szDecimals = assetUniverse.szDecimals
    const ordersData: OrderData[] = orders.map((order) => ({
      assetIndex: assetIndex,
      isBuy: isBuy,
      price: order.price.toFixed(0),
      size: Number(order.size.toFixed(szDecimals)).toString(),
      reduceOnly: false,
      orderType: {
        limit: {
          tif: 'Gtc'
        }
      }
    }))

    // Leverage safety: ensure chosen leverage ≤ max allowed for total notional of batch
    const totalNotional = ordersData.reduce(
      (sum, od) => sum + Number(od.price) * Number(od.size),
      0
    )
    const maxAllowedLeverage = getMaxAllowedLeverageForNotional({
      perpsMeta,
      assetUniverse,
      notional: totalNotional
    })
    if (maxAllowedLeverage && leverage > maxAllowedLeverage) {
      toast.error(
        `${t('Selected leverage')} (${leverage}x) ${t('exceeds max allowed')} (${maxAllowedLeverage}x) ${t('for total notional')} $${totalNotional.toLocaleString()}`
      )
      return
    }

    if (ordersData.some((item) => Number(item.price) * Number(item.size) < 10)) {
      console.error(
        `Minimum order must be at the least $10. One of your order's value is less than $10`
      )
      toast.error(`Margin Insufficient`, {
        description: `One or more individual order's value is less than $10`
      })
      return
    }

    const toastId = toast.loading(`${t('Placing')} ${totalOrders} ${t('orders')}...`)
    try {
      if (!sdkL1ActionClient) return
      const adjustedBuilderFee = getAdjustedBuilderFee()
      const placeOrderRes = await sdkL1ActionClient.order({
        grouping: 'na',
        builder: {
          b: BUILDER_ADDRESS,
          f: adjustedBuilderFee
        },
        orders: ordersData.map((order) => ({
          a: order.assetIndex,
          b: order.isBuy,
          p: order.price,
          s: order.size,
          r: order.reduceOnly,
          t: order.orderType
        }))
      })
      console.log(placeOrderRes)
      // TODO: Handle the status of all Orders
      const status = placeOrderRes.response.data.statuses[0]
      if ('error' in status) {
        console.error('Order placement error:', status.error)
        toast.error(t('Something went wrong, check the console or contact support'), {
          id: toastId
        })
      } else if ('filled' in status) {
        const filled = status.filled
        const action = isBuy ? 'long' : 'short'
        const assetName = selectedAsset.split('-')[0]
        toast.success(
          `${filled.totalSz} ${assetName} ${action} ${t('at an average price of')} ${filled.avgPx}`,
          {
            id: toastId
          }
        )
      } else if ('resting' in status) {
        toast.success(t('Order Placed Successfully'), {
          id: toastId
        })
      }
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error(t('Something went wrong, check the console or contact support'), {
        id: toastId
      })
    }
  }

  const handlePercentChange = (newUsdPercent: number) => {
    if (!clearingHouseState) return
    setPercent(newUsdPercent)
    if (isInputUsd) {
      const totalUsd = (maxAllowedUsd * newUsdPercent) / 100
      const totalAssetSize = totalUsd / (Number(allMids[selectedAsset]) || 1)
      setTotalUsd(totalUsd)
      setTotalAssetSize(totalAssetSize)
    } else {
      const totalAssetSize = (maxAllowedUsd / (Number(allMids[selectedAsset]) || 1)) * newUsdPercent
      const totalUsd = totalAssetSize * (Number(allMids[selectedAsset]) || 1)
      setTotalAssetSize(totalAssetSize)
      setTotalUsd(totalUsd)
    }
  }

  const handleIncrease = () => setTotalOrders((prev) => prev + 1)
  const handleDecrease = () => setTotalOrders((prev) => (prev > 0 ? prev - 1 : 0))
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : 0
    setTotalOrders(isNaN(value) ? 0 : value)
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
        <label htmlFor="startPrice" className={cn('text-xs text-white/70', isRTL && 'text-end')}>
          {t('Start Price')}
        </label>
        <div className={cn('flex w-full gap-3 items-center', isRTL && 'flex-row-reverse')}>
          <Input
            type="text"
            placeholder="0"
            value={startPrice}
            onChange={(e) => setStartPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
            className={cn(
              'w-full text-end text-white placeholder:text-white',
              isRTL && 'text-start'
            )}
          />
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size={'sm'}
                disabled
                className="text-xs w-16 flex items-center justify-start"
              >
                <p className="text-xs flex-1 w-full">{isInputUsd ? 'USDC' : selectedAsset}</p>
                <IconChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-fit" align="end">
              <DropdownMenuItem onClick={() => setIsInputUsd(true)}>
                <p className="text-xs w-10 text-center">USDC</p>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsInputUsd(false)}>
                <p className="text-xs w-10 text-center">{selectedAsset}</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
        <label htmlFor="endPrice" className={cn('text-xs text-white/70', isRTL && 'text-end')}>
          {t('End Price')}
        </label>
        <div className={cn('flex w-full gap-3 items-center', isRTL && 'flex-row-reverse')}>
          <Input
            type="text"
            placeholder="0"
            value={endPrice}
            onChange={(e) => setEndPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
            className={cn(
              'w-full text-end text-white placeholder:text-white',
              isRTL && 'text-start'
            )}
          />
          {/* <Button
            variant="outline"
            size={'sm'}
            className="text-xs w-16 bg-transparent hover:bg-transparent"
            disabled={true}
          >
            <IconRefresh className="size-3" />
            {t('Last')}
          </Button> */}
        </div>
        <Separator orientation="horizontal" />
        <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
          <label htmlFor="percent" className={cn('text-xs text-white/70', isRTL && 'text-end')}>
            {t('Total Size')}
          </label>
          <p className="text-xs text-white/20">
            {t('Max')}: {maxAllowedUsd} USDC
          </p>
        </div>
        <div className={cn('flex w-full gap-3 items-center', isRTL && 'flex-row-reverse')}>
          <Input
            type="text"
            placeholder="0"
            value={totalUsd}
            onChange={(e) => setTotalUsd(e.target.value ? parseFloat(e.target.value) : undefined)}
            className={cn(
              'w-full text-end text-white placeholder:text-white',
              isRTL && 'text-start'
            )}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size={'sm'}
                className="text-xs w-16 flex items-center justify-start"
              >
                <p className="text-xs flex-1 w-full">USDC</p>
                <IconChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-fit" align="end">
              <DropdownMenuItem onClick={() => setIsInputUsd(true)}>
                <p className="text-xs w-10 text-center">USDC</p>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsInputUsd(false)}>
                <p className="text-xs w-10 text-center">{selectedAsset}</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className={cn('flex mt-2 flex-col gap-2 w-full items-center justify-center')}>
          <div className={cn('flex items-center w-full gap-3', isRTL && 'flex-row-reverse')}>
            <Slider
              min={1}
              max={100}
              dir={isRTL ? 'rtl' : 'ltr'}
              value={[percent]}
              onValueChange={(value) => handlePercentChange(value[0])}
              className="flex-1 w-full"
            />
            <div
              className={cn(
                'flex !w-16 shrink-0 items-center pr-2 justify-center  text-white/70 rounded-md gap-2',
                isRTL && 'flex-row-reverse pr-0 pl-2'
              )}
            >
              <Input
                className={cn(
                  'flex-1 p-0 text-end text-white bg-transparent border-none',
                  isRTL && 'text-start'
                )}
                value={percent}
                onChange={(e) => handlePercentChange(parseInt(e.target.value, 10))}
              />
              <IconPercentage className="size-3" />
            </div>
          </div>
          <ToggleGroup
            size={'sm'}
            className={cn(
              'flex mt-1 items-center  justify-between w-full',
              isRTL && 'flex-row-reverse'
            )}
            type="single"
            value={percent.toString()}
            onValueChange={(value) => value !== '' && handlePercentChange(parseInt(value, 10))}
          >
            {[0, 25, 50, 75, 100].map((value, index) => (
              <ToggleGroupItem
                key={`leverage-tick-${value}-${index}`}
                value={value.toString()}
                className={cn(
                  'cursor-pointer text-xs font-semibold data-[state=on]:bg-transparent transition-colors duration-150 focus:outline-none',
                  percent === value ? 'bg-primary text-white' : 'bg-transparent text-white/70',
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
        <Separator orientation="horizontal" />
        <div className="flex items-center justify-center h-fit gap-1">
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
                  'bg-white/10 flex-1 text-xs',
                  totalOrders > 1 ? 'bg-accent text-accent-foreground' : 'bg-white/10 text-white/70'
                )}
                size={'sm'}
              >
                {t('Order Count')}
                <IconChevronDown className="size-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="orderCount"
                  className={cn('text-xs text-white/70', isRTL && 'text-end')}
                >
                  {t('Order Count')}
                </label>
                <div className={cn('flex items-center gap-3 rounded-lg')}>
                  <Button onClick={handleDecrease} size={'sm'} variant={'outline'}>
                    <IconMinus className="size-3" />
                  </Button>
                  <Input
                    type="text"
                    value={totalOrders}
                    onChange={handleChange}
                    min={1}
                    max={100}
                    step={1}
                    className="text-white placeholder:text-white"
                  />
                  <Button onClick={handleIncrease} size={'sm'} variant={'outline'}>
                    <IconPlus className="size-3" />
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'bg-white/10 flex-1 text-xs',
                  sizeSkew && sizeSkew > 0
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-white/10 text-white/70'
                )}
                size={'sm'}
              >
                {t('Skew')}
                <IconChevronDown className="size-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="sizeSkew"
                  className={cn('text-xs text-white/70', isRTL && 'text-end')}
                >
                  {t('Size Skew')}
                </label>
                <Input
                  type="text"
                  value={sizeSkew}
                  onChange={(e) => setSizeSkew(e.target.value ? parseFloat(e.target.value) : 0)}
                  placeholder="0"
                  className="text-white"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex flex-col gap-2 h-fit w-full p-2">
        <Separator orientation="horizontal" />
        <div className="w-full h-fit">
          {!isAgentApproved || currentFeeApproval === 0 ? (
            <Button
              className="w-full font-semibold cursor-pointer"
              // className="flex items-center gap-1 ml-auto font-medium text-xs align-middle cursor-pointer"
              onClick={async () => openAgentModal()}
            >
              {t('Enable Trading')}
            </Button>
          ) : (
            <Button
              className={cn(
                'w-full',
                totalUsd! > maxAllowedUsd || !totalUsd || !totalAssetSize
                  ? 'bg-white/10 hover:cursor-not-allowed '
                  : ''
              )}
              onClick={handleSubmit}
              type="submit"
              disabled={totalUsd! > maxAllowedUsd || !totalUsd || !totalAssetSize}
            >
              {t('Scale Buy')} ({totalOrders} {t('Orders')})
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
export default Scale
