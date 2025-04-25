'use client'
import { VaultsOrder } from '@/utils/vaultsTypes'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { OPEN_ORDERS_VAULTS_COLUMNS } from '@/utils/constants'
import Pagination from '@/components/common/Pagination'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import WalletNotConnected from '@/components/common/WalletNotConnected'
import infoicon from '@/assets/images/info_icon.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'
import bitcoinicon from '@/assets/images/bitcoin_logo.svg'

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
  const { isConnected } = useAccount()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.ceil(vaultsOrders?.length / pageSize)
  const paginatedOrders = useMemo(() => {
    return vaultsOrders?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [vaultsOrders, currentPage, pageSize])

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
  return (
    <div className="overflow-x-auto w-full px-3">
      {isConnected ? (
        <>
          {' '}
          <table className="w-full text-white hidden lg:table">
            <thead>
              <tr>
                {OPEN_ORDERS_VAULTS_COLUMNS?.map((col) => (
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
              </tr>
            </thead>
            <tbody>
              {paginatedOrders?.map((order) => {
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
              })}
            </tbody>
          </table>
          <ResponsiveDataCard
            columns={[...OPEN_ORDERS_VAULTS_COLUMNS]}
            data={paginatedOrders || []}
            renderRow={(item) => (
              <RenderRowData item={item} columns={[...OPEN_ORDERS_VAULTS_COLUMNS]} />
            )}
          />
          {vaultsOrders?.length > 0 && (
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
        <WalletNotConnected title="You have no orders." />
      )}
    </div>
  )
}

export default OpenOrders
