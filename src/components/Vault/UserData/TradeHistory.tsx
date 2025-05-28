import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { TRADEHISTORY_VAULTS_COLUMNS } from '@/utils/constants'
import Pagination from '@/components/common/Pagination'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import infoicon from '@/assets/images/info_icon.svg'
import sortingIcon from '@/assets/images/sorting_icon.svg'
import exporticon from '../../../assets/images/export_icon.svg'

export const vaultsTradeHistory = Array.from({ length: 10 }, (_, index) => {
  return {
    id: index + 1,
    vid: index + 1,
    time: '11-05 12:35:16',
    symbol: 'COMPUSDC Perpetual',
    buysell: 'Sell',
    price: '160.8900',
    quantity: '12.34567 BTC',
    fee: '12.3456',
    realizedProfit: '14.1234 USDC'
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

type TradeHistoryProps = {
  showExportButton?: boolean
}

function TradeHistory({ showExportButton }: TradeHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.ceil(vaultsTradeHistory?.length / pageSize)

  const paginatedOrders = useMemo(() => {
    return vaultsTradeHistory?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [vaultsTradeHistory, currentPage, pageSize])

  const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
    return (
      <div className="flex flex-col gap-2 text-white text-sm">
        {columns?.map((col) => (
          <div key={col?.key} className="flex justify-between">
            <span className="text-[#8B8BA0]">{col?.label}</span>
            <span
              className={
                col?.key === 'buysell'
                  ? 'text-red font-medium'
                  : col?.key === 'contract'
                    ? 'truncate'
                    : ''
              }
            >
              <span className="flex item-center gap-x-2">
                {item[col?.key] ?? '-'}
                {col?.key === 'time' && (
                  <Image src={exporticon} alt="export" style={{ width: 13, height: 'auto' }} />
                )}
              </span>
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full hidden lg:table text-white">
        <thead>
          <tr>
            {TRADEHISTORY_VAULTS_COLUMNS?.map((col) => (
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
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  <div className="flex items-center gap-x-1">
                    <span>{order?.time}</span>
                    <Image
                      src={exporticon}
                      alt="export"
                      style={{ width: 13, height: 'auto' }}
                      className="mx-1 cursor-pointer opacity-70"
                    />
                  </div>
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.symbol}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-red font-medium text-sm">
                  {order?.buysell}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.price}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.quantity}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.fee}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.realizedProfit}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <ResponsiveDataCard
        columns={[...TRADEHISTORY_VAULTS_COLUMNS]}
        data={paginatedOrders || []}
        renderRow={(item) => (
          <RenderRowData item={item} columns={[...TRADEHISTORY_VAULTS_COLUMNS]} />
        )}
        showExportButton={showExportButton}
      />
      {vaultsTradeHistory?.length > 0 && (
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

export default TradeHistory
