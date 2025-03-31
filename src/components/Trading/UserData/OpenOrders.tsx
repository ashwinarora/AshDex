import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { useWalletModal } from '@/context/WalletModalContext'
import { Order, SpotOrder, WsOrder } from '@/utils/hyperLiquidTypes'
import Pagination from '@/components/common/Pagination'
import {
  ORDER_INTERVALS,
  OPEN_ORDERS_SPOT_COLUMNS,
  OPEN_ORDERS_FEATURE_COLUMNS
} from '@/utils/constants'
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

const OpenOrders = ({ setOpenOrdersCount }: { setOpenOrdersCount: (count: number) => void }) => {
  const { address, isConnected } = useAccount()
  const { toggleConnectWalletModal } = useWalletModal()
  const { sdk } = useHyperLiquid()
  const pathname = usePathname()
  const { data: openOrders, isLoading } = useQuery({
    queryKey: ['openOrders', address],
    queryFn: async () => {
      const response = await sdk.info.getUserOpenOrders(address)
      return response as Order[]
    },
    enabled: !!address && !!sdk
  })
  const [selectedInterval, setSelectedInterval] = useState<(typeof ORDER_INTERVALS)[number]>('1s')
  const [orders, setOrders] = useState<Order[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const totalPages = Math.ceil(
    (pathname === '/spot' ? spotOrders?.length : orders?.length) / pageSize
  )

  const paginatedOrders = useMemo(() => {
    const data = pathname === '/spot' ? spotOrders : orders
    return data?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [orders, spotOrders, currentPage, pageSize, pathname])

  const selectedColumns = useMemo(() => {
    return pathname === '/spot' ? OPEN_ORDERS_SPOT_COLUMNS : OPEN_ORDERS_FEATURE_COLUMNS
  }, [pathname])

  const [columns, setColumns] = useState(selectedColumns)

  useEffect(() => {
    setColumns(selectedColumns)
  }, [selectedColumns])

  useEffect(() => {
    if (openOrders) {
      setOrders(openOrders)
      setOpenOrdersCount(openOrders.length)
    }
  }, [openOrders, setOpenOrdersCount])

  useEffect(() => {
    if (!sdk) return
    sdk.subscriptions.subscribeToOrderUpdates(address, (data: WsOrder[]) => {
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
    <div className="overflow-x-auto w-full px-3">
      <div className="flex ml-1 my-2 items-center overflow-hidden gap-2 text-white text-sm">
        {ORDER_INTERVALS?.map((interval) => (
          <button
            key={interval}
            onClick={() => setSelectedInterval(interval)}
            className={`px-2 text-sm cursor-pointer py-1 rounded-full transition-all ${
              selectedInterval === interval
                ? 'bg-white/10 font-semibold text-white backdrop-blur-lg'
                : 'text-gray-400 font-medium hover:text-gray-300'
            }`}
          >
            {interval}
          </button>
        ))}
      </div>
      {isConnected ? (
        <>
          {' '}
          <table className="w-full text-white">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col?.key}
                    className="pt-3 pb-1 max-[1025px]:px-7 pr-7 text-sm font-normal text-[#8B8BA0] text-left"
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
                        setOrders([])
                        setOpenOrdersCount(0)
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
                      <td className="py-2.5 pr-7 max-[1025px]:px-7  opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order.time}
                      </td>
                      <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        <div className="flex flex-col gap-1">
                          <span>{order.symbol}</span>
                          <span className="text-[#8B8BA0] text-xs font-normal">
                            {order.symbolText}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order.type}
                      </td>
                      <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order.side}
                      </td>
                      <td className="py-2.5 pr-7 max-[1025px]:px-7  opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order.price}
                      </td>
                      <td className="py-2.5 pr-7 max-[1025px]:px-7  opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order.amount}
                      </td>
                      <td className="py-2.5 pr-7  max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order.filled}
                      </td>
                      <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        <span className="text-[#E2464A] ml-1 px-1.5 py-1 rounded-lg bg-[#1F1F30] font-semibold text-sm">
                          {order.reduceOnly}
                        </span>
                      </td>
                      <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        <span className="text-[#2FA766] ml-1 px-1.5 py-1 rounded-lg bg-[#1F1F30] font-semibold text-sm">
                          {order.postOnly}
                        </span>
                      </td>
                      <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        <div className="flex flex-col gap-1">
                          <span>{order.triggerConditions}</span>
                          <span className="text-[#8B8BA0] text-xs font-normal">{'Mark Price'}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-7 max-[1025px]:px-7 text-[#7D67FF] font-medium text-sm">
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
          {(orders?.length > 0 || spotOrders?.length > 0) && (
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
        <div className="flex my-8 max-[1025px]:pt-0 pt-7 flex-col text-center justify-center items-center w-full">
          <Image
            src={noordericon}
            width={90}
            height={90}
            alt={`noordericon`}
            className="h-[93px] w-[93px] max-[770px]:w-[70px] max-[770px]:h-[70px]"
          />
          <span className="font-medium text-center my-2.5 text-base text-[#FFFFFF]">
            You have no orders.
          </span>
          <button
            onClick={toggleConnectWalletModal}
            className="2xl:px-[20px] max-[770px]:mt-1 mt-5 px-[11px] flex items-center py-[10px] bg-[#5F46F9] font-bold text-[#FFFFFF] text-sm rounded-md md:rounded-xl cursor-pointer"
          >
            <span className="">Connect Wallet</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default OpenOrders
