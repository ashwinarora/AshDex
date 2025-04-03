import { useHyperLiquid } from '@/context/HyperLiquid'
import { Order, WsOrder } from '@/utils/hyperLiquidTypes'
import { useQuery } from '@tanstack/react-query'
import infoicon from '@/assets/images/info_icon.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import Pagination from '@/components/common/Pagination'

const columns = [
  { key: 'coin', label: 'Coin' },
  { key: 'side', label: 'Side' },
  { key: 'limitPrice', label: 'Limit Price' },
  { key: 'size', label: 'Size' },
  { key: 'orderID', label: 'Order ID' },
  { key: 'timestamp	', label: 'Timestamp' },
  { key: 'originalsize', label: 'Original Size' }
]

const OpenOrders = ({ setOpenOrdersCount }: { setOpenOrdersCount: (count: number) => void }) => {
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

  const [orders, setOrders] = useState<Order[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(orders.length / 10)

  const paginatedOrders = useMemo(() => {
    return orders.slice((currentPage - 1) * 10, currentPage * 10)
  }, [orders, currentPage])

  useEffect(() => {
    if (openOrders) {
      setOrders(openOrders)
      setOpenOrdersCount(openOrders.length)
    }
  }, [openOrders, setOpenOrdersCount])

  useEffect(() => {
    if (!sdk) return
    sdk.subscriptions.subscribeToOrderUpdates(address, (data: WsOrder[]) => {
      console.log('Order updates', data)
      setOrders((prevOrders) => {
        const newOrders = [...prevOrders]
        data.forEach((order) => {
          const index = newOrders.findIndex((o) => o.oid === order.order.oid)
          if (order.status !== 'open') {
            newOrders.splice(index, 1)
            return
          }
          newOrders[index] = {
            coin: order.order.coin,
            limitPx: Number(order.order.limitPx),
            oid: order.order.oid,
            origSz: Number(order.order.origSz),
            side: order.order.side === 'b' ? 'buy' : 'sell',
            sz: Number(order.order.sz),
            timestamp: order.statusTimestamp
          }
        })
        setOpenOrdersCount(newOrders.length)
        return newOrders
      })
    })
    return () => {
      sdk.subscriptions.unsubscribeFromOrderUpdates()
    }
  }, [sdk, address, setOpenOrdersCount])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-white">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="pt-3 pb-1 px-7 text-sm font-normal text-[#8B8BA0] text-left"
              >
                <div className="flex justify-start items-center gap-1">
                  <Image src={shortingicon} alt="Sort" className="w-3 h-3 cursor-pointer" />
                  <span>{col.label}</span>
                  <Image src={infoicon} alt="Info" className="w-4 h-4 cursor-pointer" />
                </div>
              </th>
            ))}
            <th className="px-7">
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded cursor-pointer"
                onClick={async () => {
                  await sdk.custom.cancelAllOrders()
                  setOrders([])
                  setOpenOrdersCount(0)
                }}
              >
                Cancel All
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders?.map((order) => (
            <tr key={order.oid}>
              <td className="py-2 px-7 border-b border-gray-700">{order.coin}</td>
              <td
                className={`py-2 px-7 border-b border-gray-700 ${order.side === 'buy' ? 'text-green-500' : 'text-red-500'}`}
              >
                {order.side}
              </td>
              <td className="py-2 px-7 border-b border-gray-700">{order.limitPx}</td>
              <td className="py-2 px-7 border-b border-gray-700">{order.sz}</td>
              <td className="py-2 px-7 border-b border-gray-700">{order.oid}</td>
              <td className="py-2 px-7 border-b border-gray-700">
                {new Date(order.timestamp).toLocaleString()}
              </td>
              <td className="py-2 px-7 border-b border-gray-700">{order.origSz}</td>
              <td className="py-2 px-7 border-b border-gray-700">
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  onClick={async () => {
                    const res = await sdk.exchange.cancelOrder()
                    console.log(res)
                  }}
                >
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {orders?.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}

export default OpenOrders
