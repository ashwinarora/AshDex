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
  const { universe, agentWallet, hyperliquidAxios } = useHyperLiquid()
  const { address, chain, isConnected: isWalletConnected } = useAccount()
  const [totalSize, setTotalSize] = useState<number>()
  const [startPrice, setStartPrice] = useState<number>()
  const [endPrice, setEndPrice] = useState<number>()
  const [totalOrders, setTotalOrders] = useState<number>()
  const [sizeSkew, setSizeSkew] = useState<number>()
  const [isBuy, setIsBuy] = useState<boolean>(true)

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

        <button
          type="submit"
          className="mt-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Place Order
        </button>
      </form>
    </div>
  )
}

export default Scale
