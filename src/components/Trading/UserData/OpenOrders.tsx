import { useHyperLiquid } from '@/context/HyperLiquid'
import { Order } from '@/utils/hyperLiquidTypes'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'

const OpenOrders = () => {
  const { address } = useAccount()
  const { sdk } = useHyperLiquid()
  const { data: openOrders, isLoading } = useQuery({
    queryKey: ['openOrders', address],
    queryFn: async () => {
      const response = await sdk.info.getUserOpenOrders(address)
      return response as Order[]
    },
    enabled: !!address && !!sdk
  })

  const handleCancelOrder = async () => {
    // await sdk.orders.cancelOrder(orderId);
  }

  const handleCancelAllOrders = async () => {
    // await sdk.orders.cancelAllOrders();
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h2 className="text-xl font-bold mb-4">Open Orders</h2>
      <table className="min-w-full bg-gray-800 text-left">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-700">Coin</th>
            <th className="py-2 px-4 border-b border-gray-700">Side</th>
            <th className="py-2 px-4 border-b border-gray-700">Limit Price</th>
            <th className="py-2 px-4 border-b border-gray-700">Size</th>
            <th className="py-2 px-4 border-b border-gray-700">Order ID</th>
            <th className="py-2 px-4 border-b border-gray-700">Timestamp</th>
            <th className="py-2 px-4 border-b border-gray-700">Original Size</th>
            <th className="py-2 px-4 border-b border-gray-700">
              <button
                onClick={handleCancelAllOrders}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              >
                Cancel All
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {openOrders?.map((order) => (
            <tr key={order.oid}>
              <td className="py-2 px-4 border-b border-gray-700">{order.coin}</td>
              <td
                className={`py-2 px-4 border-b border-gray-700 ${order.side === 'buy' ? 'text-green-500' : 'text-red-500'}`}
              >
                {order.side}
              </td>
              <td className="py-2 px-4 border-b border-gray-700">{order.limitPx}</td>
              <td className="py-2 px-4 border-b border-gray-700">{order.sz}</td>
              <td className="py-2 px-4 border-b border-gray-700">{order.oid}</td>
              <td className="py-2 px-4 border-b border-gray-700">
                {new Date(order.timestamp).toLocaleString()}
              </td>
              <td className="py-2 px-4 border-b border-gray-700">{order.origSz}</td>
              <td className="py-2 px-4 border-b border-gray-700">
                <button
                  onClick={() => handleCancelOrder()}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OpenOrders
