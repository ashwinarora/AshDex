import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { DEPOSITORS_VAULTS_COLUMNS } from '@/utils/constants'
import Pagination from '@/components/common/Pagination'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import infoicon from '@/assets/images/info_icon.svg'
import sortingIcon from '@/assets/images/sorting_icon.svg'

export const vaultsDepositors = Array.from({ length: 10 }, (_, index) => {
  return {
    id: index + 1,
    vid: index + 1,
    depositor: '0x677d...84e7',
    vaultAmount: '$4 712,62',
    unrealizedPNL: '-$825,58',
    allTimePNL: '-$820,38',
    daysFollowing: '691'
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

function Depositors() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const totalPages = Math.ceil(vaultsDepositors?.length / pageSize)

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

  const paginatedOrders = useMemo(() => {
    return vaultsDepositors?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [vaultsDepositors, currentPage, pageSize])

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full  hidden lg:table text-white">
        <thead>
          <tr>
            {DEPOSITORS_VAULTS_COLUMNS?.map((col) => (
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
                  {order?.depositor}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.vaultAmount}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.unrealizedPNL}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.allTimePNL}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-white font-medium text-sm">
                  {order?.daysFollowing}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <ResponsiveDataCard
        columns={[...DEPOSITORS_VAULTS_COLUMNS]}
        data={paginatedOrders || []}
        renderRow={(item) => <RenderRowData item={item} columns={[...DEPOSITORS_VAULTS_COLUMNS]} />}
      />
      {vaultsDepositors?.length > 0 && (
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

export default Depositors
