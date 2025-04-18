'use client'
import { Order, WsOrder } from '@/utils/hyperliquid/hyperLiquidTypes'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { useWalletModal } from '@/context/WalletModalContext'
import { OPEN_ORDERS_COLUMNS } from '@/utils/constants'
import infoicon from '@/assets/images/info_icon.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'
import useIsSpot from '@/hooks/useIsSpot'

const OpenOrders = () => {
  const { address, isConnected } = useAccount()
  const { toggleConnectWalletModal } = useWalletModal()
  const { sdk } = useHyperLiquid()
  const queryClient = useQueryClient()
  const isSpot = useIsSpot()

  const { data: openOrders, isLoading } = useQuery<Order[]>({
    queryKey: ['openOrders', address],
    queryFn: async () => {
      const response = await sdk.info.getUserOpenOrders(address)
      return response
    },
    enabled: !!address && !!sdk,
    initialData: []
  })

  useEffect(() => {
    if (!sdk || !address) return
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
      if (sdk.subscriptions.unsubscribeFromUserOrders) {
        sdk.subscriptions.unsubscribeFromUserOrders()
      } else {
        console.warn('unsubscribeFromUserOrders is not available in the SDK.')
      }
    }
  }, [sdk, address, queryClient])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="overflow-x-auto w-full px-3">
      {isConnected ? (
        <table className="w-full text-white">
          <thead>
            <tr>
              {OPEN_ORDERS_COLUMNS.map((col) => (
                <th
                  key={col?.key}
                  className="pt-3 pb-1 max-[1025px]:px-7 pr-7 text-sm font-normal text-[#8B8BA0] text-left"
                >
                  <div className="flex justify-start items-center gap-1">
                    {col?.label && (
                      <>
                        <Image src={shortingicon} alt="Sort" className="w-3 h-3 cursor-pointer" />
                        <span>{col.label}</span>
                        <Image src={infoicon} alt="Info" className="w-4 h-4 cursor-pointer" />
                      </>
                    )}
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
            {openOrders
              .filter((order) => order.coin.includes(isSpot ? 'SPOT' : 'PERP'))
              ?.map((order) => (
                <tr key={order.oid} className="border-b border-white/10">
                  <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                    {order.coin}
                  </td>
                  <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                    {order.side}
                  </td>
                  <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                    {order.limitPx}
                  </td>
                  <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                    {order.sz}
                  </td>
                  <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                    {order.oid}
                  </td>
                  <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                    {new Date(order.timestamp).toLocaleString()}
                  </td>
                  <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                    {order.origSz}
                  </td>
                  <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
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
      ) : (
        <div className="flex my-8 max-[1025px]:pt-0 pt-7 flex-col text-center justify-center items-center w-full">
          <span className="font-medium text-center my-2.5 text-base text-[#FFFFFF]">
            You have no orders.
          </span>
          <button
            onClick={toggleConnectWalletModal}
            className="2xl:px-[20px] max-lg:mt-1 mt-5 px-[11px] flex items-center py-[10px] bg-primary font-bold text-[#FFFFFF] text-sm rounded-md md:rounded-xl cursor-pointer"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  )
}

export default OpenOrders
