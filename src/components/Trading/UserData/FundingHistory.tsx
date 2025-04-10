import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FUNDINGHISTORY_VAULTS_COLUMNS } from '@/utils/constants'
import Pagination from '@/components/common/Pagination'
import infoicon from '@/assets/images/info_icon.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'

export const vaultsFundingHistory = Array.from({ length: 10 }, (_, index) => {
  return {
    id: index + 1,
    vid: index + 1,
    time: '12:00 UTC',
    symbol: 'BTC/USDC',
    fundingRate: '0.005%',
    amountPaid: '+5 USDC'
  }
})

function FundingHistory() {
  const pathname = usePathname()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getOrdersLength(pathname: string, vaultsFundingHistory?: any[]): number {
    if (pathname?.includes('/vaults')) {
      return vaultsFundingHistory?.length || 0
    } else {
      return 0
    }
  }
  const totalPages = Math.ceil(getOrdersLength(pathname, vaultsFundingHistory) / pageSize)
  const getColumnsByPathname = (pathname: string) => {
    if (pathname?.includes('/vaults')) {
      return FUNDINGHISTORY_VAULTS_COLUMNS
    } else {
      return []
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDataByPathname = (pathname: string, vaultsFundingHistory?: any[]) => {
    if (pathname?.includes('/vaults')) {
      return vaultsFundingHistory
    } else {
      return []
    }
  }

  const data = useMemo(
    () => getDataByPathname(pathname, vaultsFundingHistory),
    [pathname, vaultsFundingHistory]
  )

  const paginatedOrders = useMemo(() => {
    return data?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [data, currentPage, pageSize])

  const selectedColumns = useMemo(() => getColumnsByPathname(pathname), [pathname])
  const [columns, setColumns] = useState(selectedColumns)

  useEffect(() => {
    setColumns(selectedColumns)
  }, [selectedColumns])

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full text-white">
        <thead>
          <tr>
            {columns?.map((col) => (
              <th
                key={col?.key}
                className="pt-3 pb-2 max-[1025px]:px-7 pr-7 text-sm font-normal text-[#8B8BA0] text-left"
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
                  <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {order?.time}
                  </td>
                  <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {order?.symbol}
                  </td>
                  <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {order?.fundingRate}
                  </td>
                  <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {order?.amountPaid}
                  </td>
                </tr>
              )
            } else {
              return <></>
            }
          })}
        </tbody>
      </table>
      {vaultsFundingHistory?.length > 0 && (
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

export default FundingHistory
