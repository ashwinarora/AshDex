'use client'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import BuyOrSell from './components/BuyOrSell'
import CheckBox from '@/components/common/CheckBox'
import { OrderData } from '@/utils/hyperliquid/PlaceOrder'
import { BUILDER_ADDRESS, SPOT_DELTA } from '@/utils/constants'
import Slider1 from '@/assets/images/slider_value.svg'
import usdcicon from '@/assets/images/usdc_icon.svg'
import plusicon from '@/assets/images/plus_icon.svg'
import minusicon from '@/assets/images/minus_icon.svg'
import { IPlaceOrderProps } from '.'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { toast } from 'react-toastify'

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

const ScaleSpot = ({ selectedAsset }: IPlaceOrderProps) => {
  const { agentWallet, spotState, spotAssetContext, sdkExchangeClient } = useHyperliquid()
  const { data: spotMeta } = useSpotMeta()
  const [totalSize, setTotalSize] = useState<number>()
  const [startPrice, setStartPrice] = useState<number>()
  const [endPrice, setEndPrice] = useState<number>()
  const [totalOrders, setTotalOrders] = useState<number>(10)
  const [sizeSkew, setSizeSkew] = useState<number>()
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [isReduceOnly, setIsReduceOnly] = useState<boolean>(false)
  const [usdPercent, setUsdPercent] = useState(0)
  const { spotKeyToName } = useSpotMeta()

  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()

  const maxAllowed = useMemo(() => {
    if (!spotState) return 0
    return isBuy
      ? (spotState?.balances?.find((b) => b.coin === 'USDC')?.total ?? 0)
      : (spotState?.balances?.find((b) => isMatch(b.coin, selectedAsset))?.total ?? 0)
  }, [spotState, selectedAsset, isBuy])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!spotMeta) return
    if (!agentWallet) return
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

  const handleUsdPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percent = parseFloat(e.target.value) || 0
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
    <div>
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      <form onSubmit={handleSubmit} className="flex flex-col shadow-md rounded-md w-full">
        <div className="mb-1 px-4 border-[#FFFFFF0F] border-b">
          <label className="block mb-0.5 font-medium text-gray-300 text-xs">Start Price</label>
          <div className="flex">
            <input
              type="text"
              value={startPrice ?? '0'}
              onChange={(e) =>
                setStartPrice(e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className="p-1.5 rounded-md focus:outline-none w-full font-medium text-sm focus:none focus:none"
            />
            <span className="flex items-center font-medium text-white text-xs">
              <Image
                src={usdcicon}
                style={{ width: 45, height: 'auto' }}
                className="pr-1"
                alt="usdcicon"
              />
              USDC
            </span>
          </div>
        </div>
        <div className="mb-1 px-4 border-[#FFFFFF0F] border-b">
          <label className="block mb-0.5 font-medium text-gray-300 text-xs">End Price</label>
          <div className="flex">
            <input
              type="text"
              value={endPrice ?? '0'}
              onChange={(e) => setEndPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
              className="p-1.5 rounded-md focus:outline-none w-full font-medium text-sm focus:none focus:none"
            />
            <span className="flex items-center font-medium text-white text-xs">
              <Image
                src={usdcicon}
                style={{ width: 45, height: 'auto' }}
                className="pr-1"
                alt="usdcicon"
              />
              USDC
            </span>
          </div>
        </div>
        <div className="flex items-end mb-1 px-4 pb-2 border-[#FFFFFF0F] border-b w-full">
          <div className="w-5/6">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={usdPercent}
              onChange={handleUsdPercentChange}
              className="rounded-lg outline-none w-full h-2.5 appearance-none cursor-pointer"
              style={{
                background:
                  'linear-gradient(to right, #5F46F9 0%, #5F46F9 ' +
                  usdPercent +
                  '%, #2A1B3D ' +
                  usdPercent +
                  '%, #2A1B3D 100%)'
              }}
            />
            <Image src={Slider1} alt="Slider1" width={20} height={20} className="mt-1 w-full" />
            <div className="flex justify-between mt-1 text-gray-500 text-xs">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
          <div className="relative pl-4">
            <input
              type="string"
              className="flex justify-between bg-white/10 px-4 py-2 border border-white/10 rounded-md outline-none w-20 h-11"
              value={usdPercent}
              onChange={handleUsdPercentChange}
            />
            <span className="top-2.5 right-2 absolute text-gray-500">%</span>
          </div>
        </div>
        <div className="mb-1 px-4 border-[#FFFFFF0F] border-b">
          <div className="flex justify-between mb-1">
            <label className="block mb-0.5 font-medium text-gray-300 text-xs">Total Size</label>
            <span className="block font-medium text-[#8B8BA0] text-xs">
              Balance = {Number(maxAllowed).toFixed(2)}{' '}
              {isBuy ? 'USDC' : spotKeyToName.get(selectedAsset)}
            </span>
          </div>
          <div className="flex">
            <input
              type="text"
              value={totalSize ?? '0'}
              onChange={(e) =>
                setTotalSize(e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className="p-1.5 rounded-md focus:outline-none w-full font-medium text-sm focus:none focus:none"
            />
            <span className="flex items-center font-medium text-white text-xs">
              <Image
                src={usdcicon}
                style={{ width: 45, height: 'auto' }}
                className="pr-1"
                alt="usdcicon"
              />
              USDC
            </span>
          </div>
        </div>
        <div className="mb-1 px-4 border-[#FFFFFF0F] border-b">
          <span className="block mb-0.5 font-medium text-gray-300 text-xs">Scale Settings</span>
          <label className="mb-2">
            <span className="block mb-0.5 font-medium text-gray-300 text-xs">Number of Orders</span>
            <div className="flex items-center gap-2 mb-1 rounded-lg">
              <button
                onClick={handleDecrease}
                className="bg-white/10 px-3 py-1.5 border border-white/10 rounded-md cursor-pointer"
              >
                <Image
                  src={minusicon}
                  style={{ width: 20, height: 20 }}
                  className="pr-1"
                  alt="minusicon"
                />
              </button>
              <input
                type="text"
                value={totalOrders}
                onChange={handleChange}
                className="bg-white/10 px-3 py-1.5 border-2 border-white/10 rounded-md focus:outline-none w-full font-medium text-sm text-center"
              />
              <button
                onClick={handleIncrease}
                className="bg-white/10 px-3 py-1.5 border border-white/10 rounded-md cursor-pointer"
              >
                <Image
                  src={plusicon}
                  style={{ width: 20, height: 20 }}
                  className="pr-1"
                  alt="plusicon"
                />
              </button>
            </div>
          </label>
        </div>
        <div className="mb-1 px-4 pb-2 border-[#FFFFFF0F] border-b">
          <label className="block mb-0.5 font-medium text-gray-300 text-xs">Size Skew</label>
          <input
            type="text"
            value={sizeSkew ?? ''}
            onChange={(e) => setSizeSkew(e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="0.00"
            className="bg-white/10 px-3 py-1.5 border-2 border-white/10 rounded-md focus:outline-none w-full font-medium text-sm"
          />
        </div>
        <label className="flex items-center mt-1 mb-1 px-4">
          <CheckBox
            label=""
            setIsChecked={(checked) => setIsReduceOnly(checked)}
            isChecked={isReduceOnly}
          />
          <span className="font-medium text-[#E8E0F1] text-xs">Reduce Only</span>
        </label>
        <div className="px-4">
          {!isAgentApproved || currentFeeApproval === 0 ? (
            <button
              type="button"
              className="bg-primary hover:bg-purple-600 py-2 rounded-2xl w-full text-white cursor-pointer"
              onClick={async () => openAgentModal()}
            >
              Establish Connection
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              type="submit"
              disabled={totalSize! > Number(maxAllowed)}
              className="bg-primary py-[12px] rounded-xl w-full font-bold text-white text-base cursor-pointer px[24px]"
            >
              Scale Buy ({totalOrders} Orders)
            </button>
          )}
        </div>
        {/* <span className="mx-4 my-4 font-medium text-[#8B8BA0] text-sm">
          Order will execute <b>0.912 BTC</b> in <b>10 equal orders of 0.076 BTC.</b>
        </span> */}
      </form>
    </div>
  )
}
export default ScaleSpot
