'use client'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import BuyOrSell from './components/BuyOrSell'
import CheckBox from '@/components/common/CheckBox'
import { OrderData, placeOrder } from '@/utils/hyperliquid/PlaceOrder'
import { getCoinName } from '@/utils/utils'
import { BUILDER_ADDRESS, SPOT_DELTA } from '@/utils/constants'
import Slider1 from '@/assets/images/slider_value.svg'
import usdcicon from '@/assets/images/usdc_icon.svg'
import plusicon from '@/assets/images/plus_icon.svg'
import minusicon from '@/assets/images/minus_icon.svg'
import { IPlaceOrderProps } from '.'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { hyperliquidAxios } from '@/config/axios'

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
  const { agentWallet, spotState, spotAssetContext } = useHyperliquid()
  const { data: spotMeta } = useSpotMeta()
  const { chain } = useAccount()
  const [totalSize, setTotalSize] = useState<number>()
  const [startPrice, setStartPrice] = useState<number>()
  const [endPrice, setEndPrice] = useState<number>()
  const [totalOrders, setTotalOrders] = useState<number>(10)
  const [sizeSkew, setSizeSkew] = useState<number>()
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [isReduceOnly, setIsReduceOnly] = useState<boolean>(false)
  const [usdPercent, setUsdPercent] = useState(0)

  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()

  const maxAllowed = useMemo(() => {
    if (!spotState) return 0
    return isBuy
      ? (spotState.balances.find((b) => b.coin === 'USDC')?.total ?? 0)
      : (spotState.balances.find((b) => isMatch(b.coin, selectedAsset))?.total ?? 0)
  }, [spotState, selectedAsset, isBuy])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!spotMeta.tokens) return
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
    const res = await placeOrder(agentWallet, chain?.testnet || false, hyperliquidAxios, {
      orders: ordersData,
      grouping: 'na',
      builder: {
        address: BUILDER_ADDRESS,
        fee: currentFeeApproval
      }
    })
    console.log(res)
  }
  const handleUsdPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percent = parseFloat(e.target.value) || 0
    setUsdPercent(percent)
    if (isBuy) {
      const newTotal = (percent / 100) * maxAllowed
      setTotalSize(newTotal)
    } else {
      const newAmount = (percent / 100) * maxAllowed
      setTotalSize(newAmount * maxAllowed)
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
      <form onSubmit={handleSubmit} className="flex flex-col w-full rounded-md shadow-md">
        <div className="border-b px-4 mb-1 border-[#FFFFFF0F]">
          <label className="block text-xs font-medium text-gray-300 mb-0.5">Start Price</label>
          <div className="flex">
            <input
              type="text"
              value={startPrice ?? '0'}
              onChange={(e) =>
                setStartPrice(e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className="w-full rounded-md p-1.5 focus:outline-none focus:none focus:none text-sm font-medium"
            />
            <span className="text-white flex items-center text-xs font-medium">
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
        <div className="border-b px-4 mb-1 border-[#FFFFFF0F]">
          <label className="block text-xs font-medium text-gray-300 mb-0.5">End Price</label>
          <div className="flex">
            <input
              type="text"
              value={endPrice ?? '0'}
              onChange={(e) => setEndPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full rounded-md p-1.5 focus:outline-none focus:none focus:none text-sm font-medium"
            />
            <span className="text-white flex items-center text-xs font-medium">
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
        <div className="flex w-full mb-1 items-end px-4 border-b border-[#FFFFFF0F] pb-2">
          <div className="w-5/6">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={usdPercent}
              onChange={handleUsdPercentChange}
              className="w-full cursor-pointer appearance-none h-2.5 rounded-lg outline-none"
              style={{
                background:
                  'linear-gradient(to right, #5F46F9 0%, #5F46F9 ' +
                  usdPercent +
                  '%, #2A1B3D ' +
                  usdPercent +
                  '%, #2A1B3D 100%)'
              }}
            />
            <Image src={Slider1} alt="Slider1" width={20} height={20} className="w-full mt-1" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
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
              className="w-20 h-11 rounded-md border border-white/10 bg-white/10 outline-none px-4 py-2 flex justify-between"
              value={usdPercent}
              onChange={handleUsdPercentChange}
            />
            <span className="absolute right-2 top-2.5 text-gray-500">%</span>
          </div>
        </div>
        <div className="border-b px-4 mb-1 border-[#FFFFFF0F]">
          <div className="flex mb-1 justify-between">
            <label className="block text-xs font-medium text-gray-300 mb-0.5">Total Size</label>
            <span className="block text-xs font-medium text-[#8B8BA0]">
              Balance = {maxAllowed.toFixed(2)} {isBuy ? 'USDC' : getCoinName(selectedAsset)}
            </span>
          </div>
          <div className="flex">
            <input
              type="text"
              value={totalSize ?? '0'}
              onChange={(e) =>
                setTotalSize(e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className="w-full rounded-md p-1.5 focus:outline-none focus:none focus:none text-sm font-medium"
            />
            <span className="text-white flex items-center text-xs font-medium">
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
        <div className="px-4 border-b mb-1 border-[#FFFFFF0F]">
          <span className="block text-xs font-medium text-gray-300 mb-0.5">Scale Settings</span>
          <label className="mb-2">
            <span className="block text-xs font-medium text-gray-300 mb-0.5">Number of Orders</span>
            <div className="flex items-center gap-2 mb-1 rounded-lg">
              <button
                onClick={handleDecrease}
                className="rounded-md px-3 py-1.5 border border-white/10 bg-white/10 cursor-pointer"
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
                className="w-full text-center rounded-md px-3 py-1.5 border-2 border-white/10 bg-white/10 text-sm font-medium focus:outline-none"
              />
              <button
                onClick={handleIncrease}
                className="rounded-md px-3 py-1.5 border border-white/10 bg-white/10 cursor-pointer"
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
        <div className="px-4 border-b mb-1 pb-2 border-[#FFFFFF0F]">
          <label className="block text-xs font-medium text-gray-300 mb-0.5">Size Skew</label>
          <input
            type="text"
            value={sizeSkew ?? ''}
            onChange={(e) => setSizeSkew(e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="0.00"
            className="w-full rounded-md px-3 py-1.5 border-2 border-white/10 bg-white/10 text-sm font-medium focus:outline-none"
          />
        </div>
        <label className="mb-1 mt-1 px-4 flex items-center">
          <CheckBox
            label=""
            setIsChecked={(checked) => setIsReduceOnly(checked)}
            isChecked={isReduceOnly}
          />
          <span className="text-xs font-medium text-[#E8E0F1]">Reduce Only</span>
        </label>
        <div className="px-4">
          {!isAgentApproved || currentFeeApproval === 0 ? (
            <button
              type="button"
              className="py-2 rounded-2xl w-full  bg-primary hover:bg-purple-600 text-white cursor-pointer"
              onClick={async () => openAgentModal()}
            >
              Establish Connection
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              type="submit"
              disabled={totalSize! > maxAllowed}
              className="py-[12px] px[24px] font-bold rounded-xl w-full text-base bg-primary text-white cursor-pointer"
            >
              Scale Buy ({totalOrders} Orders)
            </button>
          )}
        </div>
        {/* <span className="font-medium mx-4 my-4 text-sm text-[#8B8BA0]">
          Order will execute <b>0.912 BTC</b> in <b>10 equal orders of 0.076 BTC.</b>
        </span> */}
      </form>
    </div>
  )
}
export default ScaleSpot
