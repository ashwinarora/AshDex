import { useMemo, useState } from 'react'
import BuyOrSell from './components/BuyOrSell'
import { OrderData } from '@/utils/hyperliquid/PlaceOrder'
import { getPerpsUniverseIndex } from '@/utils/utils'
import { cn } from '@/lib/utils'
import { BUILDER_ADDRESS } from '@/utils/constants'

import { IPlaceOrderProps } from '.'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquid } from '@/store/HyperliquidStore'
import MarginMode from './components/MarginMode'
import LeverageMargin from './components/LeverageMargin'
import { toast } from 'react-toastify'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  IconCheckbox,
  IconRefresh,
  IconSquare,
  IconInfoCircle,
  IconChevronDown,
  IconMinus,
  IconPlus
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

const Scale = ({ selectedAsset }: IPlaceOrderProps) => {
  const { agentWallet, clearingHouseState, allMids, perpsMeta, sdkExchangeClient } =
    useHyperliquid()
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
    const szDecimals = perpsMeta.universe[assetIndex].szDecimals
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
    const toastId = toast.loading(`Placing ${totalOrders} orders...`)
    try {
      if (!sdkExchangeClient) return
      const placeOrderRes = await sdkExchangeClient.order({
        grouping: 'na',
        builder: {
          b: BUILDER_ADDRESS,
          f: currentFeeApproval
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
        toast.update(toastId, {
          render: '❌' + status.error,
          type: 'error',
          isLoading: false,
          autoClose: 3000
        })
      } else if ('filled' in status) {
        const filled = status.filled
        const action = isBuy ? 'long' : 'short'
        const assetName = selectedAsset.split('-')[0]
        toast.update(toastId, {
          render: `✅ ${filled.totalSz} ${assetName} ${action} at average price of ${filled.avgPx}`,
          type: 'success',
          isLoading: false,
          autoClose: 3000
        })
      } else if ('resting' in status) {
        toast.update(toastId, {
          render: `✅ Order Placed Successfully`,
          type: 'success',
          isLoading: false,
          autoClose: 3000
        })
      }
    } catch (error) {
      console.error('Error placing order:', error)
      toast.update(toastId, {
        render: 'Failed to place orders.',
        type: 'error',
        isLoading: false
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
      <div className="flex flex-col gap-2 px-2 pt-4 h-full w-full flex-1">
        <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
        <Separator orientation="horizontal" />
        <MarginMode isCross={isCross} setIsCross={setIsCross} />
        <LeverageMargin
          selectedAsset={selectedAsset}
          leverage={leverage}
          setLeverage={setLeverage}
        />
        <Separator orientation="horizontal" />
        <label htmlFor="startPrice" className="text-xs text-white/50">
          Start Price
        </label>
        <div className="flex w-full gap-3 items-center">
          <Input
            type="text"
            placeholder="0"
            value={startPrice}
            onChange={(e) => setStartPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
            className={cn('w-full text-right text-white placeholder:text-white')}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size={'sm'}
                disabled
                className="text-xs min-w-18 w-fit flex items-center justify-start"
                // className="flex items-center gap-1 ml-auto font-medium text-xs align-middle cursor-pointer"
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
          </DropdownMenu>
        </div>
        <label htmlFor="endPrice" className="text-xs text-white/50">
          End Price
        </label>
        <div className="flex w-full gap-3 items-center">
          <Input
            type="text"
            placeholder="0"
            value={endPrice}
            onChange={(e) => setEndPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
            className={cn('w-full text-right text-white placeholder:text-white')}
          />
          <Button
            variant="outline"
            size={'sm'}
            className="text-xs min-w-18 w-fit flex items-center justify-center"
            // className="flex items-center gap-1 ml-auto font-medium text-xs align-middle cursor-pointer"
            onClick={() => {}}
          >
            <IconRefresh className="size-3" />
            Last
          </Button>
          {/* */}
        </div>
        <Separator orientation="horizontal" />
        <div className="flex items-center justify-between">
          <label htmlFor="percent" className="text-xs text-white/50">
            Total Size
          </label>
          <p className="text-xs text-white/50">Max: {maxAllowedUsd} USDC</p>
        </div>
        <div className="flex w-full gap-3 items-center">
          <Input
            type="text"
            placeholder="0"
            value={totalUsd}
            onChange={(e) => setTotalUsd(e.target.value ? parseFloat(e.target.value) : undefined)}
            className={cn('w-full text-right text-white placeholder:text-white')}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size={'sm'}
                className="text-xs min-w-18 w-fit flex items-center justify-start"
                // className="flex items-center gap-1 ml-auto font-medium text-xs align-middle cursor-pointer"
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
        <div className="flex mt-2 flex-col gap-2 w-full items-center justify-center">
          <div className="flex items-center w-full gap-3">
            <Slider
              min={1}
              max={100}
              value={[percent]}
              onValueChange={(value) => handlePercentChange(value[0])}
              className="w-full"
            />
            <Input
              type="text"
              value={percent}
              onChange={(e) => handlePercentChange(parseInt(e.target.value, 10))}
              className={cn('w-20 text-xs text-right text-white placeholder:text-white')}
            />
          </div>
          <ToggleGroup
            size={'sm'}
            className="flex mt-1 items-center bg-white/5 justify-between w-full"
            type="single"
            value={percent.toString()}
            onValueChange={(value) => value !== '' && handlePercentChange(parseInt(value, 10))}
          >
            {[0, 25, 50, 75, 100].map((value, index) => (
              <ToggleGroupItem
                key={`leverage-tick-${value}-${index}`}
                value={value.toString()}
                className={cn(
                  'first:rounded-l-md last:rounded-r-md cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
                  percent === value ? 'bg-primary text-white' : 'bg-transparent text-white/50'
                )}
              >
                {value}%
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <Separator orientation="horizontal" />
        <div className="flex items-center justify-center h-fit gap-2">
          <Toggle
            size={'sm'}
            className="bg-white/5"
            pressed={isReduceOnly}
            onPressedChange={setIsReduceOnly}
          >
            {isReduceOnly ? <IconCheckbox className="size-3" /> : <IconSquare className="size-3" />}
            <p className="text-xs font-semibold">Reduce Only</p>
            <IconInfoCircle className="size-3" />
          </Toggle>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'bg-white/5 flex-1 text-xs',
                  totalOrders > 1 ? 'bg-accent text-accent-foreground' : 'bg-white/5 text-white/50'
                )}
                size={'sm'}
              >
                Order Count
                <IconChevronDown className="size-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <div className="flex flex-col gap-2">
                <label htmlFor="orderCount" className="text-xs text-white/50">
                  Order Count
                </label>
                <div className="flex items-center gap-3 rounded-lg">
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
                  'bg-white/5 flex-1 text-xs',
                  sizeSkew && sizeSkew > 0
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-white/5 text-white/50'
                )}
                size={'sm'}
              >
                Skew
                <IconChevronDown className="size-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <div className="flex flex-col gap-2">
                <label htmlFor="sizeSkew" className="text-xs text-white/50">
                  Size Skew
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
              Enable Trading
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
              Scale Buy ({totalOrders} Orders)
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
export default Scale
