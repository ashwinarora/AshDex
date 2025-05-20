import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { DEPOSIT_WITHDRAWALS_VAULTS_COLUMNS } from '@/utils/constants'
import Pagination from '@/components/common/Pagination'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
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

type ColumnType = {
  key: string
  label: string
}

type RenderRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  columns: ColumnType[]
}

type DepositsAndWithdrawalsProps = {
  showExportButton?: boolean
}

function DepositsAndWithdrawals({ showExportButton }: DepositsAndWithdrawalsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.ceil(vaultsDepositAndWIthdrawals?.length / pageSize)
  const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
    return (
      <div className="flex flex-col gap-2 text-white text-sm">
        {columns?.map((col) => (
          <div key={col?.key} className="flex justify-between">
            <span className="text-[#8B8BA0]">{col?.label}</span>
            <span className={col?.key === 'contract' ? 'truncate' : ''}>
              <span
                className={`flex ${col?.key === 'status' ? 'text-[#2FA766] bg-[#1F1F30] px-1.5 py-1 rounded-lg font-medium ' : ''} item-center gap-x-2`}
              >
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

  const paginatedOrders = useMemo(() => {
    return vaultsDepositAndWIthdrawals?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [vaultsDepositAndWIthdrawals, currentPage, pageSize])

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full text-white hidden lg:table">
        <thead>
          <tr>
            {DEPOSIT_WITHDRAWALS_VAULTS_COLUMNS?.map((col) => (
              <th
                key={col?.key}
                className="pt-3 pb-2 max-xl:px-7 pr-7 text-sm font-normal text-[#8B8BA0] text-left"
              >
                <div className="flex justify-start items-center gap-1">
                  {col?.label ? (
                    <>
                      <Image
                        src={shortingicon}
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
                  <span className="text-[#2FA766] bg-[#1F1F30] px-1.5 py-1 rounded-lg font-medium text-sm">
                    {order?.status}
                  </span>
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.network}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.action}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.accountValueChangr}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.fee}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <ResponsiveDataCard
        columns={[...DEPOSIT_WITHDRAWALS_VAULTS_COLUMNS]}
        data={paginatedOrders || []}
        renderRow={(item) => (
          <RenderRowData item={item} columns={[...DEPOSIT_WITHDRAWALS_VAULTS_COLUMNS]} />
        )}
        showExportButton={showExportButton}
      />
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
