'use client'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import BuyOrSell from './components/BuyOrSell'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { OrderData, placeOrder } from '@/utils/hyperliquid/PlaceOrder'
import { getUniverseIndex } from '@/utils/utils'
import { BUILDER_ADDRESS } from '@/utils/constants'
import { IExtraAgent } from '@/utils/hyperLiquidTypes'
import Slider1 from '@/assets/images/slider_value.svg'
import usdcicon from '@/assets/images/usdc_icon.svg'
import plusicon from '@/assets/images/plus_icon.svg'
import minusicon from '@/assets/images/minus_icon.svg'

interface ScaleProps {
  selectedAsset: string
}

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

const Scale = ({ selectedAsset }: ScaleProps) => {
  const { universe, agentWallet, hyperliquidAxios, clearingHouseState } = useHyperLiquid()
  const { address, chain, isConnected: isWalletConnected } = useAccount()
  const [totalSize, setTotalSize] = useState<number>()
  const [startPrice, setStartPrice] = useState<number>()
  const [endPrice, setEndPrice] = useState<number>()
  const [totalOrders, setTotalOrders] = useState<number>(10)
  const [sizeSkew, setSizeSkew] = useState<number>()
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [isReduceOnly, setIsReduceOnly] = useState<boolean>(false)
  const [usdPercent, setUsdPercent] = useState(0)

  const maxAllowedUsd = useMemo(() => {
    if (!clearingHouseState) return 0
    if (!isReduceOnly) return clearingHouseState.withdrawable
    const existingPosition = clearingHouseState.assetPositions.find((pos) => {
      return pos.position.coin === selectedAsset
    })
    if (!existingPosition) return clearingHouseState.withdrawable
    if (existingPosition.position.szi > 0 && isBuy) return 0
    if (existingPosition.position.szi < 0 && !isBuy) return 0
    let maxUsd = clearingHouseState.withdrawable
    let totalUSD = 0
    let iterationCount = 0
    const MAX_ITERATIONS = 10000
    while (true) {
      const orders = calculateScaleOrders(totalUSD, startPrice!, endPrice!, totalOrders!, sizeSkew!)
      const totalSize = orders.reduce((sum, order) => sum + order.size, 0)
      if (totalSize >= Math.abs(existingPosition.position.szi)) {
        break
      }
      maxUsd = totalUSD
      totalUSD += 1 // Increment totalUSD for the next iteration
    }
    return Math.min(maxUsd, clearingHouseState.withdrawable)
  }, [
    isReduceOnly,
    clearingHouseState,
    selectedAsset,
    isBuy,
    startPrice,
    endPrice,
    totalOrders,
    sizeSkew
  ])

  console.log(maxAllowedUsd)

  const { data: extraAgents } = useQuery({
    queryKey: ['extraAgents'],
    queryFn: async () => {
      const response = await hyperliquidAxios.post('/info', {
        type: 'extraAgents',
        user: address
      })
      return response.data as IExtraAgent[]
    },
    enabled: isWalletConnected && !!hyperliquidAxios
  })

  const isAgentApproved = useMemo(() => {
    if (!extraAgents) return false
    return extraAgents.some(
      (agent) => agent.address.toLowerCase() === agentWallet?.address.toLowerCase()
    )
  }, [extraAgents, agentWallet])

  const { data: currentFeeApproval } = useQuery({
    queryKey: ['maxBuilderFee', address, BUILDER_ADDRESS],
    queryFn: async () => {
      const response = await hyperliquidAxios.post('/info', {
        type: 'maxBuilderFee',
        user: address,
        builder: BUILDER_ADDRESS
      })
      return response.data as number
    },
    enabled: isWalletConnected && !!hyperliquidAxios && !!agentWallet && isAgentApproved
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!universe) return
    if (!agentWallet) return
    if (!currentFeeApproval) return
    const orders = calculateScaleOrders(totalSize!, startPrice!, endPrice!, totalOrders!, sizeSkew!)
    console.log(orders)
    const assetIndex = getUniverseIndex(universe, selectedAsset)
    const szDecimals = universe[assetIndex].szDecimals
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
    if (!clearingHouseState) return
    const newUsdPercent = parseFloat(e.target.value) || 0
    setUsdPercent(newUsdPercent)
    setTotalSize((newUsdPercent * maxAllowedUsd) / 100)
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
        <div className="border-b px-4 mb-3 border-[#FFFFFF0F]">
          <label className="mb-2 ">
            <span className="block mb-1 text-sm font-medium text-[#8B8BA0]">Start Price</span>
            <div className="flex ">
              <input
                type="text"
                value={startPrice ?? '0'}
                onChange={(e) =>
                  setStartPrice(e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
              />
              <span className="text-white flex items-center text-sm font-medium">
                <Image src={usdcicon} width={45} height={45} className="pr-1" alt="usdcicon" />
                USDC
              </span>
            </div>
          </label>
        </div>
        <div className="border-b  px-4 mb-3 border-[#FFFFFF0F]">
          <label className="mb-2">
            <span className="block mb-1 text-sm font-medium text-[#8B8BA0]">End Price</span>
            <div className="flex ">
              <input
                type="text"
                value={endPrice ?? '0'}
                onChange={(e) =>
                  setEndPrice(e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
              />
              <span className="text-white flex items-center text-sm font-medium">
                <Image src={usdcicon} width={45} height={45} className="pr-1" alt="usdcicon" />
                USDC
              </span>
            </div>
          </label>
        </div>

        <div className="flex w-full mb-3 items-end px-4 border-b border-[#FFFFFF0F] pb-4">
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
            <Image src={Slider1} alt="" width={20} height={20} className="w-full mt-1" />
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

        <div className="border-b px-4 mb-3 border-[#FFFFFF0F]">
          <label className="mb-2">
            <div className="flex mb-1 justify-between">
              <span className="block  text-sm font-medium text-[#8B8BA0]">Total Size</span>
              <span className="block text-sm font-medium text-[#8B8BA0]">
                Balance: {clearingHouseState?.withdrawable.toFixed(2)} USDC
              </span>
            </div>
            <div className="flex ">
              <input
                type="text"
                value={totalSize ?? '0'}
                onChange={(e) =>
                  setTotalSize(e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
              />
              <span className="text-white flex items-center text-sm font-medium">
                <Image src={usdcicon} width={45} height={45} className="pr-1" alt="usdcicon" />
                USDC
              </span>
            </div>
          </label>
        </div>
        <div className="border-b px-4 mb-3 border-[#FFFFFF0F]">
          <span className="block mb-3 text-sm font-bold text-[#8B8BA0]">Scale Settings</span>
          <label className="mb-2">
            <span className="block mb-2 text-sm font-medium text-[#8B8BA0]">Number of Orders</span>
            <div className="flex items-center gap-2 mb-3 rounded-lg">
              <button
                onClick={handleDecrease}
                className="rounded-md px-3 py-5 border border-white/10 bg-white/10 cursor-pointer"
              >
                <Image src={minusicon} width={20} height={20} className="pr-1" alt="minusicon" />
              </button>
              <input
                type="text"
                value={totalOrders}
                onChange={handleChange}
                className="w-full text-center rounded-md px-3 py-[9px] border-2 border-white/10 bg-white/10 text-base font-medium focus:outline-none"
              />
              <button
                onClick={handleIncrease}
                className="rounded-md px-3 py-4 border border-white/10 bg-white/10 cursor-pointer"
              >
                <Image src={plusicon} width={20} height={20} className="pr-1" alt="plusicon" />
              </button>
            </div>
          </label>
        </div>

        <label className="mb-2">
          <span className="block mb-1 text-sm font-medium text-gray-200">Size Skew</span>
          <input
            type="number"
            value={sizeSkew ?? ''}
            onChange={(e) => setSizeSkew(e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Enter size skew"
            className="w-full px-3 py-2 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <label className="mb-2 flex items-center">
          <input
            type="checkbox"
            checked={isReduceOnly}
            onChange={(e) => setIsReduceOnly(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-200">Reduce Only</span>
        </label>
        <div className="px-4">
          <button
            type="submit"
            disabled={totalSize! > maxAllowedUsd}
            className={
              'py-[12px] px[24px] font-bold rounded-xl w-full text-base bg-[#5F46F9] text-white cursor-pointer'
            }
          >
            Scale Buy ({totalOrders} Orders)
          </button>
        </div>
        <span className="font-medium mx-4 my-4 text-sm text-[#8B8BA0]">
          Order will execute <b>0.912 BTC</b> in <b>10 equal orders of 0.076 BTC.</b>
        </span>
      </form>
    </div>
  )
}

export default Scale
