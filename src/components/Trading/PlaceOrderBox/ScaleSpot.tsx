'use client'
import { useMemo, useState } from 'react'
import BuyOrSell from './components/BuyOrSell'
import { OrderData } from '@/utils/hyperliquid/PlaceOrder'
import { BUILDER_ADDRESS, SPOT_DELTA } from '@/utils/constants'

import { IPlaceOrderProps } from '.'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  IconCheckbox,
  IconRefresh,
  IconSquare,
  IconInfoCircle,
  IconChevronDown,
  IconMinus,
  IconPlus
} from '@tabler/icons-react'
import { DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ToggleGroupItem } from '@/components/ui/toggle-group'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup } from '@/components/ui/toggle-group'
import { PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Toggle } from '@/components/ui/toggle'
import { Popover } from '@/components/ui/popover'
import { useShallow } from 'zustand/react/shallow'
import { useUserFee } from '@/hooks/useUserFee'
import { useTranslate } from '@tolgee/react'

interface Order {
  price: number
  size: number
}
function calculateScaleOrders(
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

const isMatch = (a: string, b: string): boolean => a.split('-')[0] === b.split('-')[0]

const ScaleSpot = ({ selectedAsset, isRTL }: IPlaceOrderProps) => {
  const { spotState, spotAssetContext, sdkL1ActionClient } = useHyperliquidStore(
    useShallow((state) => ({
      spotState: state.spotState,
      spotAssetContext: state.spotAssetContext,
      sdkL1ActionClient: state.sdkL1ActionClient
    }))
  )
  const { t } = useTranslate()
  const { data: spotMeta } = useSpotMeta()
  const [totalSize, setTotalSize] = useState<number>()
  const [startPrice, setStartPrice] = useState<number>()
  const [endPrice, setEndPrice] = useState<number>()
  const [totalOrders, setTotalOrders] = useState<number>(10)
  const [sizeSkew, setSizeSkew] = useState<number>()
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [isReduceOnly, setIsReduceOnly] = useState<boolean>(false)
  const [usdPercent, setUsdPercent] = useState(0)

  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()
  const { getAdjustedBuilderFee } = useUserFee()
  const maxAllowed = useMemo(() => {
    if (!spotState) return 0
    return isBuy
      ? (spotState?.balances?.find((b) => b.coin === 'USDC')?.total ?? 0)
      : (spotState?.balances?.find((b) => isMatch(b.coin, selectedAsset))?.total ?? 0)
  }, [spotState, selectedAsset, isBuy])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!spotMeta) return
    if (!currentFeeApproval) return
    const orders = calculateScaleOrders(totalSize!, startPrice!, endPrice!, totalOrders!, sizeSkew!)
    console.log(orders)
    const assetIndex =
      spotAssetContext.findIndex((assets) => assets.coin.includes(selectedAsset)) + SPOT_DELTA
    const tokenData = spotMeta.tokens.find((token) => token.name.includes(selectedAsset))
    const ordersData: OrderData[] = orders.map((order) => ({
      assetIndex: assetIndex,
      isBuy: isBuy,
      price: order.price.toFixed(0),
      size: Number(order.size.toFixed(tokenData?.szDecimals)).toString(),
      reduceOnly: false,
      orderType: {
        limit: {
          tif: 'Gtc'
        }
      }
    }))
    // const res = await placeOrder(agentWallet, chain?.testnet || false, hyperliquidAxios, {
    //   orders: ordersData,
    //   grouping: 'na',
    //   builder: {
    //     address: BUILDER_ADDRESS,
    //     fee: currentFeeApproval
    //   }
    // })
    // console.log(res)
    const toastId = toast.loading(`Placing ${totalOrders} orders...`)
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
        toast.error(status.error, {
          id: toastId
        })
      } else if ('filled' in status) {
        const filled = status.filled
        const action = isBuy ? 'long' : 'short'
        const assetName = selectedAsset.split('-')[0]
        toast.success(
          `${filled.totalSz} ${assetName} ${action} at average price of ${filled.avgPx}`,
          {
            id: toastId
          }
        )
      } else if ('resting' in status) {
        toast.success('Order Placed Successfully', {
          id: toastId
        })
      }
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('Failed to place orders.', {
        id: toastId
      })
    }
  }

  const handleUsdPercentChange = (percent: number) => {
    setUsdPercent(percent)
    if (isBuy) {
      const newTotal = (percent / 100) * Number(maxAllowed)
      setTotalSize(newTotal)
    } else {
      const newAmount = (percent / 100) * Number(maxAllowed)
      setTotalSize(newAmount * Number(maxAllowed))
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
          isBuy={isBuy}
          setIsBuy={setIsBuy}
          isRTL={isRTL}
          isMarginEnabled={false}
          isCross={false}
          setIsCross={() => {}}
        />
        <Separator orientation="horizontal" />
        <div className="flex flex-col gap-3">
          <label htmlFor="startPrice" className="text-xs text-white/50">
            {t('Start Price')}
          </label>
          <div className="flex w-full gap-3 items-center">
            <Input
              type="text"
              placeholder="0"
              value={startPrice}
              onChange={(e) =>
                setStartPrice(e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className={cn('w-full text-end text-white placeholder:text-white')}
            />
            <DropdownMenu>
              <DropdownMenuTrigger disabled asChild>
                <Button
                  variant="outline"
                  size={'sm'}
                  disabled
                  className="text-xs w-16 flex items-center justify-start"
                  // className="flex items-center gap-1 ml-auto font-medium text-xs align-middle cursor-pointer"
                >
                  <p className="text-xs flex-1 w-full">{'USDC'}</p>
                  <IconChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-fit" align="end">
                <DropdownMenuItem onClick={() => {}}>
                  <p className="text-xs w-10 text-center">USDC</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <label htmlFor="endPrice" className="text-xs text-white/50">
            {t('End Price')}
          </label>
          <div className="flex w-full gap-3 items-center">
            <Input
              type="text"
              placeholder="0"
              value={endPrice}
              onChange={(e) => setEndPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
              className={cn('w-full text-end text-white placeholder:text-white')}
            />
            <Button
              variant="outline"
              size={'sm'}
              className="text-xs w-16 bg-transparent hover:bg-transparent flex items-center justify-center"
              // className="flex items-center gap-1 ml-auto font-medium text-xs align-middle cursor-pointer"
              onClick={() => {}}
            >
              <IconRefresh className="size-3" />
              Last
            </Button>
            {/* */}
          </div>
        </div>
        <Separator orientation="horizontal" />
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label htmlFor="percent" className="text-xs text-white/50">
              {t('Total Size')}
            </label>
            <p className="text-xs text-white/50">
              {t('Max')}: {Number(maxAllowed).toFixed(2)} USDC
            </p>
          </div>
          <div className="flex w-full gap-3 items-center">
            <Input
              type="text"
              placeholder="0"
              value={totalSize}
              onChange={(e) =>
                setTotalSize(e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className={cn('w-full text-end text-white placeholder:text-white')}
            />
            <DropdownMenu>
              <DropdownMenuTrigger disabled asChild>
                <Button
                  variant="outline"
                  size={'sm'}
                  className="text-xs w-16 flex items-center justify-start"
                  // className="flex items-center gap-1 ml-auto font-medium text-xs align-middle cursor-pointer"
                >
                  <p className="text-xs flex-1 w-full">USDC</p>
                  <IconChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-fit" align="end">
                <DropdownMenuItem onClick={() => {}}>
                  <p className="text-xs w-10 text-center">USDC</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-1 flex-col gap-3 mt-1 w-full items-center justify-center">
            <Slider
              min={1}
              max={100}
              value={[usdPercent]}
              onValueChange={(value) => handleUsdPercentChange(value[0])}
              className="w-full"
            />
            <ToggleGroup
              size={'sm'}
              className="flex mt-1 items-center  justify-between w-full"
              type="single"
              value={usdPercent.toString()}
              onValueChange={(value) => value !== '' && handleUsdPercentChange(parseInt(value, 10))}
            >
              {[0, 25, 50, 75, 100].map((value, index) => (
                <ToggleGroupItem
                  key={`leverage-tick-${value}-${index}`}
                  value={value.toString()}
                  className={cn(
                    'first:rounded-l-md last:rounded-r-md cursor-pointer text-xs font-semibold data-[state=on]:bg-transparent transition-colors duration-150 focus:outline-none',
                    usdPercent === value ? 'bg-primary text-white' : 'bg-transparent text-white/50'
                  )}
                >
                  {value}%
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
        <Separator orientation="horizontal" />
        <div className="flex items-center justify-center h-fit gap-3">
          <Toggle
            size={'sm'}
            className="bg-white/5"
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
                  'bg-white/5 flex-1 text-xs',
                  totalOrders > 1 ? 'bg-accent text-accent-foreground' : 'bg-white/5 text-white/50'
                )}
                size={'sm'}
              >
                {t('Order Count')}
                <IconChevronDown className="size-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <div className="flex flex-col gap-3">
                <label htmlFor="orderCount" className="text-xs text-white/50">
                  {t('Order Count')}
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
                {t('Skew')}
                <IconChevronDown className="size-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <div className="flex flex-col gap-3">
                <label htmlFor="sizeSkew" className="text-xs text-white/50">
                  {t('Size Skew')}
                </label>
                <div className="flex items-center gap-3 rounded-lg">
                  <Input
                    type="text"
                    value={sizeSkew}
                    onChange={(e) => setSizeSkew(e.target.value ? parseFloat(e.target.value) : 0)}
                    placeholder="0"
                    className="text-white"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="w-full h-fit flex flex-col gap-3 my-3">
        <Separator orientation="horizontal" />
        <div className="w-full h-fit px-2">
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
              className="w-full"
              onClick={handleSubmit}
              type="submit"
              disabled={totalSize! > Number(maxAllowed)}
            >
              {t('Scale Buy')} ({totalOrders} {t('Orders')})
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
export default ScaleSpot
