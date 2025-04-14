'use client'
import { Order, SpotOrder, WsOrder } from '@/utils/hyperliquid/hyperLiquidTypes'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { usePathname } from 'next/navigation'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { useWalletModal } from '@/context/WalletModalContext'
import Pagination from '@/components/common/Pagination'
import { OPEN_ORDERS_SPOT_COLUMNS, OPEN_ORDERS_FEATURE_COLUMNS } from '@/utils/constants'
import infoicon from '@/assets/images/info_icon.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'
import noordericon from '@/assets/images/noorder_icon.svg'
import deleteicon from '@/assets/images/delete_icon.svg'

const spotOrders: SpotOrder[] = Array.from({ length: 10 }, (_, index) => ({
  time: '11/05/25  12:35:16',
  symbol: 'BTC/USDT',
  symbolText: 'Quarterly 0925',
  type: 'Take Profit Market',
  side: 'Close Short',
  price: '98,284.03 USDC',
  amount: '12.34567 BTC',
  filled: '12.1234 BTC',
  reduceOnly: 'No',
  postOnly: 'Yes',
  triggerConditions: '95,2194.29',
  tp_sl: 'View',
  id: index + 1
}))

const OpenOrders = () => {
  const { address, isConnected } = useAccount()
  const { sdk } = useHyperLiquid()
  const { toggleConnectWalletModal } = useWalletModal()
  const queryClient = useQueryClient()
  const pathname = usePathname()
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

  const totalPages = Math.ceil(
    (pathname === '/spot' ? spotOrders?.length : openOrders?.length) / pageSize
  )

  const paginatedOrders = useMemo(() => {
    const data = pathname === '/spot' ? spotOrders : openOrders
    return data?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [openOrders, spotOrders, currentPage, pageSize, pathname])

  const selectedColumns = useMemo(() => {
    return pathname === '/spot' ? OPEN_ORDERS_SPOT_COLUMNS : OPEN_ORDERS_FEATURE_COLUMNS
  }, [pathname])

  const [columns, setColumns] = useState(selectedColumns)

  useEffect(() => {
    setColumns(selectedColumns)
  }, [selectedColumns])

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
        <>
          {' '}
          <table className="w-full text-white">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col?.key}
                    className="pt-3 pb-1 max-xl:px-7 pr-7 text-sm font-normal text-[#8B8BA0] text-left"
                  >
                    <div className="flex justify-start items-center gap-1">
                      {col?.label ? (
                        <>
                          <Image src={shortingicon} alt="Sort" className="w-3 h-3 cursor-pointer" />
                          <span>{col?.label}</span>
                          <Image src={infoicon} alt="Info" className="w-4 h-4 cursor-pointer" />
                        </>
                      ) : null}
                    </div>
                  </th>
                ))}
                {pathname !== '/spot' && (
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
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedOrders?.map((order) => {
                if ('oid' in order) {
                  return (
                    <tr key={order.oid} className=" border-b border-white/10">
                      <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order.coin}
                      </td>
                      <td className={`py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm`}>
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
                            const res = await sdk.exchange.cancelOrder()
                            console.log(res)
                          }}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  )
                } else {
                  return (
                    <tr key={order.id} className=" border-b border-white/10">
                      <td className="py-2.5 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order.time}
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        <div className="flex flex-col gap-1">
                          <span>{order.symbol}</span>
                          <span className="text-[#8B8BA0] text-xs font-normal">
                            {order.symbolText}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order.type}
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order.side}
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order.price}
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order.amount}
                      </td>
                      <td className="py-2.5 pr-7  max-xl:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order.filled}
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        <span className="text-[#E2464A] ml-1 px-1.5 py-1 rounded-lg bg-[#1F1F30] font-semibold text-sm">
                          {order.reduceOnly}
                        </span>
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        <span className="text-[#2FA766] ml-1 px-1.5 py-1 rounded-lg bg-[#1F1F30] font-semibold text-sm">
                          {order.postOnly}
                        </span>
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        <div className="flex flex-col gap-1">
                          <span>{order.triggerConditions}</span>
                          <span className="text-[#8B8BA0] text-xs font-normal">{'Mark Price'}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7 text-[#7D67FF] font-medium text-sm">
                        {order.tp_sl}
                      </td>
                      <td className="py-2.5 pl-7 max-[1450px]:px-2 text-[#FFFFFF] font-normal text-sm">
                        <Image
                          src={deleteicon}
                          alt="Delete"
                          className="w-[17px] h-[17px] cursor-pointer"
                        />
                      </td>
                    </tr>
                  )
                }
              })}
            </tbody>
          </table>
          {(openOrders?.length > 0 || spotOrders?.length > 0) && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          )}
        </>
      ) : (
        <div className="flex my-8 max-xl:pt-0 pt-7 flex-col text-center justify-center items-center w-full">
          <Image
            src={noordericon}
            width={90}
            height={90}
            alt={`noordericon`}
            className="h-[93px] w-[93px] max-lg:w-[70px] max-lg:h-[70px]"
          />
          <span className="font-medium text-center my-2.5 text-base text-[#FFFFFF]">
            You have no orders.
          </span>
          <button
            onClick={toggleConnectWalletModal}
            className="2xl:px-[20px] max-lg:mt-1 mt-5 px-[11px] flex items-center py-[10px] bg-primary font-bold text-[#FFFFFF] text-sm rounded-md md:rounded-xl cursor-pointer"
          >
            <span className="">Connect Wallet</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default OpenOrders
