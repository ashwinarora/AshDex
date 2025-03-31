import { useHyperLiquid } from '@/context/HyperLiquid'
import { Order, WsOrder } from '@/utils/hyperLiquidTypes'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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

const OpenOrders = () => {
  const { address } = useAccount()
  const { sdk } = useHyperLiquid()
  const queryClient = useQueryClient()
  const { data: openOrders, isLoading } = useQuery<Order[]>({
    queryKey: ['openOrders', address],
    queryFn: async () => {
      const response = await sdk.info.getUserOpenOrders(address)
      return response
    },
    enabled: !!address && !!sdk,
    initialData: []
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const totalPages = Math.ceil(openOrders.length || 0 / pageSize)

  const paginatedOrders = useMemo(() => {
    return openOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [openOrders, currentPage, pageSize])

  useEffect(() => {
    if (!sdk) return
    if (!address) return
    sdk.subscriptions.subscribeToOrderUpdates(address, (data: WsOrder[]) => {
      console.log('User Orders Update', data)
      queryClient.setQueryData(['openOrders', address], (oldData: Order[]) => {
        const updatedOrders = [...oldData]
        data.forEach((order) => {
          const index = updatedOrders.findIndex((o) => o.oid === order.order.oid)
          if (index !== -1) {
            if (order.status !== 'open') {
              updatedOrders.splice(index, 1)
              return
            }
            updatedOrders[index] = {
              coin: order.order.coin,
              limitPx: Number(order.order.limitPx),
              oid: order.order.oid,
              origSz: Number(order.order.origSz),
              side: order.order.side === 'buy' ? 'buy' : 'sell',
              sz: Number(order.order.sz),
              timestamp: order.statusTimestamp
            }
          } else {
            if (order.status !== 'open') return
            updatedOrders.push({
              coin: order.order.coin,
              limitPx: Number(order.order.limitPx),
              oid: order.order.oid,
              origSz: Number(order.order.origSz),
              side: order.order.side === 'buy' ? 'buy' : 'sell',
              sz: Number(order.order.sz),
              timestamp: order.statusTimestamp
            })
          }
        })
        return updatedOrders
      })
    })
    return () => {
      sdk.subscriptions.unsubscribeFromUserOrders()
    }
  }, [sdk, address, queryClient])

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
                    const res = await sdk.exchange.cancelOrder({
                      coin: order.coin,
                      o: order.oid
                    })
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

      {openOrders.length && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  )
}

export default OpenOrders
