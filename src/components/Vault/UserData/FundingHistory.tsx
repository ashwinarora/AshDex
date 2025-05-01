import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { FUNDINGHISTORY_VAULTS_COLUMNS } from '@/utils/constants'
import Pagination from '@/components/common/Pagination'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
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

type ColumnType = {
  key: string
  label: string
}

type RenderRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  columns: ColumnType[]
}

type FundingHistoryProps = {
  showExportButton?: boolean
}

function FundingHistory({ showExportButton }: FundingHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.ceil(vaultsFundingHistory?.length / pageSize)

  const paginatedOrders = useMemo(() => {
    return vaultsFundingHistory?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [vaultsFundingHistory, currentPage, pageSize])

  const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
    return (
      <div className="flex flex-col gap-2 text-white text-sm">
        {columns?.map((col) => (
          <div key={col?.key} className="flex justify-between">
            <span className="text-[#8B8BA0]">{col?.label}</span>
            <span className={col?.key === 'contract' ? 'truncate' : ''}>
              {item[col?.key] ?? '-'}
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
            {FUNDINGHISTORY_VAULTS_COLUMNS?.map((col) => (
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
                  {order?.time}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.symbol}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.fundingRate}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.amountPaid}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <ResponsiveDataCard
        columns={[...FUNDINGHISTORY_VAULTS_COLUMNS]}
        data={paginatedOrders || []}
        showExportButton={showExportButton}
        renderRow={(item) => (
          <RenderRowData item={item} columns={[...FUNDINGHISTORY_VAULTS_COLUMNS]} />
        )}
      />
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
