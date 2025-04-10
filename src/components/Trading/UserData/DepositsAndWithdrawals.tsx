import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { DEPOSIT_WITHDRAWALS_VAULTS_COLUMNS } from '@/utils/constants'
import Pagination from '@/components/common/Pagination'
import infoicon from '@/assets/images/info_icon.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'
import exporticon from '../../../assets/images/export_icon.svg'

export const vaultsDepositAndWIthdrawals = Array.from({ length: 10 }, (_, index) => {
  return {
    id: index + 1,
    vid: index + 1,
    time: '12:00 UTC',
    status: 'Completed',
    network: 'Nexon',
    action: 'Vault Withdrawal',
    accountValueChangr: '-200,00 USDC',
    fee: '$0.00'
  }
})

function DepositsAndWithdrawals() {
  const pathname = usePathname()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getOrdersLength(pathname: string, vaultsDepositAndWIthdrawals?: any[]): number {
    if (pathname?.includes('/vaults')) {
      return vaultsDepositAndWIthdrawals?.length || 0
    } else {
      return 0
    }
  }
  const totalPages = Math.ceil(getOrdersLength(pathname, vaultsDepositAndWIthdrawals) / pageSize)
  const getColumnsByPathname = (pathname: string) => {
    if (pathname?.includes('/vaults')) {
      return DEPOSIT_WITHDRAWALS_VAULTS_COLUMNS
    } else {
      return []
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDataByPathname = (pathname: string, vaultsDepositAndWIthdrawals?: any[]) => {
    if (pathname?.includes('/vaults')) {
      return vaultsDepositAndWIthdrawals
    } else {
      return []
    }
  }

  const data = useMemo(
    () => getDataByPathname(pathname, vaultsDepositAndWIthdrawals),
    [pathname, vaultsDepositAndWIthdrawals]
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
                  <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    <span className="text-[#2FA766] bg-[#1F1F30] px-1.5 py-1 rounded-lg font-medium text-sm">
                      {order?.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {order?.network}
                  </td>
                  <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {order?.action}
                  </td>
                  <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {order?.accountValueChangr}
                  </td>
                  <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {order?.fee}
                  </td>
                </tr>
              )
            } else {
              return <></>
            }
          })}
        </tbody>
      </table>
      {vaultsDepositAndWIthdrawals?.length > 0 && (
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

export default DepositsAndWithdrawals
