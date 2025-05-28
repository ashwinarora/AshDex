import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { TWAP_VAULTS_COLUMNS } from '@/utils/constants'
import Pagination from '@/components/common/Pagination'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import infoicon from '@/assets/images/info_icon.svg'
import sortingIcon from '@/assets/images/sorting_icon.svg'
import bitcoinicon from '@/assets/images/bitcoin_logo.svg'

export const vaultsTwap = Array.from({ length: 10 }, (_, index) => {
  const coins = ['Bitcoin', 'Binance Coin', 'Shiba Inu', 'Ethereum']
  const symbols = ['BTC', 'BNB', 'SHIB', 'ETH']
  return {
    id: index + 1,
    vid: index + 1,
    coin: coins[index % coins?.length],
    symbol: symbols[index % symbols?.length],
    size: '1.5 BTC',
    executedSize: '0.75 BTC',
    averagePrice: '$42,500',
    runningTime: '30m / 60m',
    reduceOnly: Math.random() > 0.5 ? 'Yes' : 'No'
  }
})

type ColumnType = {
  key: string
  label: string
}

type RenderRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  columns: ColumnType[]
}

function Twap() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.ceil(vaultsTwap?.length / pageSize)
  const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
    return (
      <div className="flex flex-col gap-2 text-white text-sm">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Image src={bitcoinicon} alt="BTC" style={{ width: 30, height: 'auto' }} />
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
              {col?.key !== 'reduceOnly' && col?.key !== 'actions' && (
                <span className="text-[#8B8BA0]">{col?.label}</span>
              )}
              {col?.key === 'reduceOnly' ? (
                <div className="flex items-center w-full justify-between gap-x-4">
                  <div className="flex flex-col gap-y-2">
                    <span className="text-[#8B8BA0]">Reduce Only</span>
                    <span
                      className={`${
                        item?.reduceOnly === 'Yes'
                          ? 'text-green bg-[#1F1F30]'
                          : 'text-red bg-[#1F1F30]'
                      } text-sm px-2 py-0.5 w-fit font-semibold rounded-lg`}
                    >
                      {item?.reduceOnly}
                    </span>
                  </div>
                  <div className="flex flex-col gap-y-2 items-end">
                    <span className="text-[#8B8BA0]">Actions</span>
                    <button className="text-white bg-white/10 px-4 py-2 rounded-xl text-sm font-semibold">
                      Terminate
                    </button>
                  </div>
                </div>
              ) : (
                <span
                  className={
                    col?.key === 'pnl'
                      ? 'text-green font-medium'
                      : col?.key === 'contract'
                        ? 'truncate'
                        : ''
                  }
                >
                  {item[col?.key]}
                </span>
              )}
            </div>
          ))}
      </div>
    )
  }

  const paginatedOrders = useMemo(() => {
    return vaultsTwap?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [vaultsTwap, currentPage, pageSize])

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full hidden lg:table text-white">
        <thead>
          <tr>
            {TWAP_VAULTS_COLUMNS?.map((col) => (
              <th
                key={col?.key}
                className="pt-3 pb-2 max-xl:px-7 pr-7 text-sm font-normal text-[#8B8BA0] text-left"
              >
                <div className="flex justify-start items-center gap-1">
                  {col?.label ? (
                    <>
                      <Image
                        src={sortingIcon}
                        alt="Sort"
                        style={{ width: 12, height: 'auto' }}
                        className="w-3 h-3 cursor-pointer"
                      />
                      <span>{col?.label}</span>
                      <Image
                        src={infoicon}
                        alt="Info"
                        style={{ width: 16, height: 'auto' }}
                        className="w-4 h-4 cursor-pointer"
                      />
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
                <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-white font-semibold text-sm">
                  <div className="flex items-center gap-x-1">
                    <Image
                      src={bitcoinicon}
                      alt="Bitcoin"
                      style={{ width: 27, height: 'auto' }}
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
                <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.size}
                </td>
                <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.executedSize}
                </td>
                <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.averagePrice}
                </td>
                <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.runningTime}
                </td>
                <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-white font-normal text-sm">
                  <span
                    className={`${order?.reduceOnly === 'Yes' ? 'text-green bg-[#1F1F30]' : 'text-red bg-[#1F1F30]'}  ml-1 px-1.5 py-1 rounded-lg  font-semibold text-sm`}
                  >
                    {order?.reduceOnly}
                  </span>
                </td>
                <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  <button className="bg-white/10 px-6 flex justify-center py-2.5 cursor-pointer font-semibold rounded-xl text-sm w-1/2">
                    Terminate
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <ResponsiveDataCard
        columns={[...TWAP_VAULTS_COLUMNS]}
        data={paginatedOrders || []}
        renderRow={(item) => <RenderRowData item={item} columns={[...TWAP_VAULTS_COLUMNS]} />}
      />
      {vaultsTwap?.length > 0 && (
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

export default Twap
