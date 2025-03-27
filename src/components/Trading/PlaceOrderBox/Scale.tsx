'use client'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { OrderData, placeOrder } from '@/utils/hyperliquid/PlaceOrder'
import { getUniverseIndex } from '@/utils/utils'
import { useMemo, useState } from 'react'
import BuyOrSell from './components/BuyOrSell'
import { useAccount } from 'wagmi'
import { BUILDER_ADDRESS } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { IExtraAgent } from '@/utils/hyperLiquidTypes'
import Slider1 from '@/assets/images/slider_value.svg'
import Image from 'next/image'

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
  const [totalOrders, setTotalOrders] = useState<number>()
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
  }, [isReduceOnly, clearingHouseState, selectedAsset, isBuy, startPrice, endPrice, totalOrders, sizeSkew])

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

  return (
    <div>
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-md p-6 mx-auto bg-gray-900 text-white rounded-md shadow-md"
      >
        <h2 className="text-2xl font-semibold mb-4">Scale Order</h2>

        <label className="mb-2">
          <span className="block mb-1 text-sm font-medium text-gray-200">Total Size</span>
          <input
            type="number"
            value={totalSize ?? ''}
            onChange={(e) => setTotalSize(e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Enter total size"
            className="w-full px-3 py-2 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <div className="flex w-full px-4 border-b border-[#FFFFFF0F] pb-4">
          <div className="w-5/6">
            <label className="block text-sm font-medium text-gray-400">Balance = {clearingHouseState?.withdrawable.toFixed(2)} USD</label>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={usdPercent}
              onChange={handleUsdPercentChange}
              className="w-full cursor-pointer appearance-none h-2.5 rounded-lg outline-none"
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

        <label className="mb-2">
          <span className="block mb-1 text-sm font-medium text-gray-200">Start Price</span>
          <input
            type="number"
            value={startPrice ?? ''}
            onChange={(e) => setStartPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Enter start price"
            className="w-full px-3 py-2 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="mb-2">
          <span className="block mb-1 text-sm font-medium text-gray-200">End Price</span>
          <input
            type="number"
            value={endPrice ?? ''}
            onChange={(e) => setEndPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Enter end price"
            className="w-full px-3 py-2 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="mb-2">
          <span className="block mb-1 text-sm font-medium text-gray-200">Total Orders</span>
          <input
            type="number"
            value={totalOrders ?? ''}
            onChange={(e) =>
              setTotalOrders(e.target.value ? parseInt(e.target.value, 10) : undefined)
            }
            placeholder="Enter total orders"
            className="w-full px-3 py-2 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

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

        <button
          type="submit"
          disabled={totalSize! > maxAllowedUsd}
          className="mt-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Place Order
        </button>
      </form>
    </div>
  )
}

export default Scale
