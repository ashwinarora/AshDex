import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { ORDERHISTORY_VAULTS_COLUMNS } from '@/utils/constants'
import Pagination from '@/components/common/Pagination'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import infoicon from '@/assets/images/info_icon.svg'
import sortingIcon from '@/assets/images/sorting_icon.svg'

export const vaultsOrdersHistory = Array.from({ length: 10 }, (_, index) => {
  const statusOptions = ['Filled', 'Rejected', 'Cancelled']
  const status = statusOptions[index % 3]
  return {
    id: index + 1,
    vid: index + 1,
    time: '11-05 12:35:16',
    symbol: 'BTC-USDC',
    symbolText: '38000-Call',
    buysell: 'Buy',
    type: 'Limit',
    price: '160.8900',
    amount: '12.34567 BTC',
    filled: '123456.1234 BTC',
    avgPrice: '132.8900',
    fee: '12.3456',
    status
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

function OrdersHistory() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.ceil(vaultsOrdersHistory?.length / pageSize)
  const paginatedOrders = useMemo(() => {
    return vaultsOrdersHistory?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [vaultsOrdersHistory, currentPage, pageSize])

  const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
    return (
      <div className="flex flex-col gap-2 text-white text-sm">
        {columns?.map((col) => (
          <div key={col?.key} className="flex justify-between">
            <span className="text-[#8B8BA0]">{col?.label}</span>
            <span className={col?.key === 'contract' ? 'truncate' : ''}>
              {col?.key === 'symbol' ? (
                <span className="flex items-center gap-x-2">
                  {item?.symbol}{' '}
                  <span className="text-[#8B8BA0] pt-0.5 font-normal text-xs">
                    {item?.symbolText}
                  </span>
                </span>
              ) : (
                <span
                  className={`flex ${
                    col?.key === 'status'
                      ? `${item?.status === 'Filled' ? 'bg-[#28283e] text-green' : ''}
                        ${item?.status === 'Rejected' ? 'bg-[#27273b] text-red' : ''}
                        ${item?.status === 'Cancelled' ? 'bg-[#505061] text-white' : ''} px-1.5 py-1 w-fit rounded-lg font-medium`
                      : `${col?.key === 'buysell' ? 'text-green' : ''}`
                  } item-center gap-x-2`}
                >
                  {item[col?.key] ?? '-'}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full text-white hidden lg:table">
        <thead>
          <tr>
            {ORDERHISTORY_VAULTS_COLUMNS?.map((col) => (
              <th
                key={col?.key}
                className="pt-3 pb-2 max-xl:px-7 pr-7 text-sm font-normal text-[#8B8BA0] text-start"
              >
                <div className="flex justify-start items-center gap-1">
                  {col?.label ? (
                    <>
                      <Image
                        src={sortingIcon}
                        alt="Sort"
                        style={{ width: 13, height: 'auto' }}
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
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.time}
                </td>
                <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-white font-semibold text-sm">
                  <div className="flex justify-between flex-col">
                    {order?.symbol}{' '}
                    <span className="text-[#8B8BA0] pt-0.5 font-normal text-xs">
                      {order?.symbolText}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-green font-medium text-sm">
                  {order?.buysell}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.type}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.price}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.amount}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.filled}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.avgPrice}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.fee}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  <span
                    className={`
                        rounded-lg px-2 py-0.5 text-sm font-medium w-fit inline-block
                        ${order?.status === 'Filled' ? 'bg-[#28283e] text-green' : ''}
                        ${order?.status === 'Rejected' ? 'bg-[#27273b] text-red' : ''}
                        ${order?.status === 'Cancelled' ? 'bg-[#505061] text-white' : ''}
                       `}
                  >
                    {order?.status}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <ResponsiveDataCard
        columns={[...ORDERHISTORY_VAULTS_COLUMNS]}
        data={paginatedOrders || []}
        renderRow={(item) => (
          <RenderRowData item={item} columns={[...ORDERHISTORY_VAULTS_COLUMNS]} />
        )}
      />
      {vaultsOrdersHistory?.length > 0 && (
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

export default OrdersHistory
