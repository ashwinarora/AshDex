import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { TRADEHISTORY_VAULTS_COLUMNS } from '@/utils/constants'
import Pagination from '@/components/common/Pagination'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import infoicon from '@/assets/images/info_icon.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'
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
  const pathname = usePathname()
  const isVaults = pathname.includes('/vaults')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getOrdersLength(pathname: string, vaultsTradeHistory?: any[]): number {
    if (pathname?.includes('/vaults')) {
      return vaultsTradeHistory?.length || 0
    } else {
      return 0
    }
  }
  const totalPages = Math.ceil(getOrdersLength(pathname, vaultsTradeHistory) / pageSize)
  const getColumnsByPathname = (pathname: string) => {
    if (pathname?.includes('/vaults')) {
      return TRADEHISTORY_VAULTS_COLUMNS
    } else {
      return []
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDataByPathname = (pathname: string, vaultsTradeHistory?: any[]) => {
    if (pathname?.includes('/vaults')) {
      return vaultsTradeHistory
    } else {
      return []
    }
  }

  const data = useMemo(
    () => getDataByPathname(pathname, vaultsTradeHistory),
    [pathname, vaultsTradeHistory]
  )

  const paginatedOrders = useMemo(() => {
    return data?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [data, currentPage, pageSize])

  const selectedColumns = useMemo(() => getColumnsByPathname(pathname), [pathname])
  const [columns, setColumns] = useState(selectedColumns)

  const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
    return (
      <div className="flex flex-col gap-2 text-white text-sm">
        {columns?.map((col) => (
          <div key={col?.key} className="flex justify-between">
            <span className="text-[#8B8BA0]">{col?.label}</span>
            <span
              className={
                col?.key === 'buysell'
                  ? 'text-[#E2464A] font-medium'
                  : col?.key === 'contract'
                    ? 'truncate'
                    : ''
              }
            >
              <span className="flex item-center gap-x-2">
                {item[col?.key] ?? '-'}
                {col?.key === 'time' && (
                  <Image src={exporticon} alt="export" width={13} height={13} />
                )}
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

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full hidden lg:table text-white">
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
          </tr>
        </thead>
        <tbody>
          {paginatedOrders?.map((order) => {
            if ('vid' in order) {
              return (
                <tr key={order.id} className=" border-b border-white/10">
                  <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    <div className="flex items-center gap-x-1">
                      <span>{order?.time}</span>
                      <Image
                        src={exporticon}
                        alt="export"
                        width={13}
                        height={13}
                        className="mx-1 cursor-pointer opacity-70"
                      />
                    </div>
                  </td>
                  <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {order?.symbol}
                  </td>
                  <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#E2464A] font-medium text-sm">
                    {order?.buysell}
                  </td>
                  <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {order?.price}
                  </td>
                  <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {order?.quantity}
                  </td>
                  <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {order?.fee}
                  </td>
                  <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {order?.realizedProfit}
                  </td>
                </tr>
              )
            } else {
              return <></>
            }
          })}
        </tbody>
      </table>
      {isVaults && (
        <ResponsiveDataCard
          columns={columns}
          data={paginatedOrders || []}
          renderRow={(item) => <RenderRowData item={item} columns={columns} />}
          showExportButton={showExportButton}
        />
      )}
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
