'use client'
import { Order, SpotOrder, VaultsOrder, WsOrder } from '@/utils/hyperliquid/hyperLiquidTypes'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { usePathname } from 'next/navigation'
import { useHyperLiquid } from '@/context/HyperLiquid'
import Pagination from '@/components/common/Pagination'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import NoData from '@/components/common/NoData'
import {
  OPEN_ORDERS_SPOT_COLUMNS,
  OPEN_ORDERS_FEATURE_COLUMNS,
  OPEN_ORDERS_VAULTS_COLUMNS
} from '@/utils/constants'
import infoicon from '@/assets/images/info_icon.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'
import deleteicon from '@/assets/images/delete_icon.svg'
import bitcoinicon from '@/assets/images/bitcoin_logo.svg'

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

export const vaultsOrders: VaultsOrder[] = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  vid: index + 1,
  time: '12:34:56 UTC',
  type: 'Limit',
  coin: ['Bitcoin', 'Binance Coin', 'Shiba Inu', 'Ethereum'][index % 4],
  symbol: ['BTC', 'BNB', 'SHB', 'ETH'][index % 4],
  direction: 'Buy',
  size: '0.25 BTC',
  originalSize: '0.27 BTC',
  orderValue: '$15,000',
  price: '$50,000',
  reduceOnly: 'No',
  triggerConditions: 'Trigger @ $59,500',
  tpsl: 'TP: $62,000\nSL: $58,500'
}))

type ColumnType = {
  key: string
  label: string
}

type RenderRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  columns: ColumnType[]
}
const OpenOrders = () => {
  const { address, isConnected } = useAccount()
  const { sdk } = useHyperLiquid()
  const queryClient = useQueryClient()
  const pathname = usePathname()
  const isVaults = pathname.includes('/vaults')
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
  const [pageSize, setPageSize] = useState(10)

  function getOrdersLength(
    pathname: string,
    spotOrders?: SpotOrder[],
    openOrders?: Order[],
    vaultsOrders?: VaultsOrder[]
  ): number {
    if (pathname.includes('/spot')) {
      return spotOrders?.length || 0
    } else if (pathname?.includes('/vaults')) {
      return vaultsOrders?.length || 0
    } else {
      return openOrders?.length || 0
    }
  }

  const totalPages = Math.ceil(
    getOrdersLength(pathname, spotOrders, openOrders, vaultsOrders) / pageSize
  )

  const getColumnsByPathname = (pathname: string) => {
    if (pathname?.includes('/spot')) {
      return OPEN_ORDERS_SPOT_COLUMNS
    } else if (pathname?.includes('/vaults')) {
      return OPEN_ORDERS_VAULTS_COLUMNS
    } else {
      return OPEN_ORDERS_FEATURE_COLUMNS
    }
  }

  const getDataByPathname = (
    pathname: string,
    spotOrders: SpotOrder[],
    openOrders: Order[],
    vaultsOrders: VaultsOrder[]
  ) => {
    if (pathname?.includes('/spot')) {
      return spotOrders
    } else if (pathname?.includes('/vaults')) {
      return vaultsOrders
    } else {
      return openOrders
    }
  }

  const data = useMemo(
    () => getDataByPathname(pathname, spotOrders, openOrders, vaultsOrders),
    [pathname, spotOrders, openOrders, vaultsOrders]
  )

  const paginatedOrders = useMemo(() => {
    return data?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [data, currentPage, pageSize])

  const selectedColumns = useMemo(() => getColumnsByPathname(pathname), [pathname])
  const [columns, setColumns] = useState(selectedColumns)

  const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
    return (
      <div className="flex flex-col gap-2 text-white text-sm">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Image src={bitcoinicon} alt="BTC" width={30} height={30} />
            <div className="flex flex-col">
              <span className="font-medium">{item?.coin}</span>
              <span className="text-xs text-[#8B8BA0]">{item?.symbol}</span>
            </div>
          </div>
        </div>
        {columns
          ?.filter((col) => col?.key !== 'coin')
          ?.map((col) => (
            <div key={col?.key} className="flex justify-between">
              <span className="text-[#8B8BA0]">{col?.label}</span>
              <span
                className={
                  col?.key === 'direction'
                    ? 'text-[#2FA766] font-medium'
                    : col?.key === 'type'
                      ? 'bg-[#505061] text-sm font-medium text-[#FFFFFF] px-1.5 py-0.5 rounded-lg'
                      : col?.key === 'reduceOnly'
                        ? 'bg-[#1F1F30] text-sm font-medium text-[#E2464A] px-2 py-0.5 rounded-lg'
                        : ''
                }
              >
                <span className="flex item-center gap-x-2">
                  {item[col?.key]
                    ? (item[col?.key] as string)
                        ?.split('\n')
                        ?.map((text: string, idx: number, arr: string[]) => (
                          <span key={idx} className="flex items-center">
                            {text}
                            {idx !== arr?.length - 1 && <span className="ml-2 opacity-60">|</span>}
                          </span>
                        ))
                    : '-'}
                </span>
              </span>
            </div>
          ))}
      </div>
    )
  }

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
          <table className="w-full text-white hidden lg:table">
            <thead>
              <tr>
                {columns?.map((col) => (
                  <th
                    key={col?.key}
                    className="pt-3 pb-2 max-xl:px-7 pr-7 text-sm font-normal text-[#8B8BA0] text-left"
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
                {pathname == '/' && (
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
                } else if ('vid' in order) {
                  return (
                    <tr key={order.id} className=" border-b border-white/10">
                      <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
                        {order?.time}
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        <span className="bg-[#505061] text-xs font-medium text-[#FFFFFF] px-2 py-1 rounded-lg">
                          {order?.type}
                        </span>
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-semibold text-sm">
                        <div className="flex items-center gap-x-1">
                          <Image
                            src={bitcoinicon}
                            alt="Bitcoin"
                            width={27}
                            height={27}
                            className="mx-1 cursor-pointer"
                          />
                          <div className="flex justify-between flex-col">
                            {order?.coin}{' '}
                            <span className="text-[#8B8BA0] pt-0.5 font-normal text-xs">
                              {order?.symbol}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-[#2FA766] font-medium text-sm">
                        {order?.direction}
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                        {order?.size}
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                        {order?.originalSize}
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                        {order?.orderValue}
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
                        {order?.price}
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        <span className="text-[#E2464A] ml-1 px-1.5 py-1 rounded-lg bg-[#1F1F30] font-semibold text-sm">
                          {order?.reduceOnly}
                        </span>
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                        <span>{order.triggerConditions}</span>
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm whitespace-pre-line">
                        <span>{order.tpsl}</span>
                      </td>
                    </tr>
                  )
                } else {
                  return (
                    <tr key={order.id} className=" border-b border-white/10">
                      <td className="py-2.5 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order?.time}
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        <div className="flex flex-col gap-1">
                          <span>{order?.symbol}</span>
                          <span className="text-[#8B8BA0] text-xs font-normal">
                            {order?.symbolText}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order?.type}
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order?.side}
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order?.price}
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order?.amount}
                      </td>
                      <td className="py-2.5 pr-7  max-xl:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        {order?.filled}
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        <span className="text-[#E2464A] ml-1 px-1.5 py-1 rounded-lg bg-[#1F1F30] font-semibold text-sm">
                          {order?.reduceOnly}
                        </span>
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        <span className="text-[#2FA766] ml-1 px-1.5 py-1 rounded-lg bg-[#1F1F30] font-semibold text-sm">
                          {order?.postOnly}
                        </span>
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                        <div className="flex flex-col gap-1">
                          <span>{order.triggerConditions}</span>
                          <span className="text-[#8B8BA0] text-xs font-normal">{'Mark Price'}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-7 max-xl:px-7 text-[#7D67FF] font-medium text-sm">
                        {order?.tp_sl}
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
          {isVaults && (
            <ResponsiveDataCard
              columns={[...columns]}
              data={paginatedOrders || []}
              renderRow={(item) => <RenderRowData item={item} columns={[...columns]} />}
            />
          )}
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
        <NoData title="You have no orders." />
      )}
    </div>
  )
}

export default OpenOrders
