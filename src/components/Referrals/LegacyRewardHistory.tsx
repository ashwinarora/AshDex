import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { LEGACY_REWARD_COLUMNS } from '@/utils/constants'
import Pagination from '@/components/common/Pagination'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import infoicon from '@/assets/images/info_icon.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'

type ColumnType = {
  key: string
  label: string
}

type RenderRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  columns: ColumnType[]
}
interface RewardHistoryItem {
  id: number
  date: string
  yourVolume: string
  yourReferralVolume: string
  totalRewardsTool: string
}
interface LegacyRewardHistoryProps {
  rewardHistory?: RewardHistoryItem[]
}

function LegacyRewardHistory({ rewardHistory }: LegacyRewardHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const totalPages = Math.ceil((rewardHistory?.length ?? 0) / pageSize)

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
    return rewardHistory?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [rewardHistory, currentPage, pageSize])

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full  hidden lg:table text-white">
        <thead>
          <tr>
            {LEGACY_REWARD_COLUMNS?.map((col) => (
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
              <tr key={order?.id} className=" border-b border-white/10">
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                  {order?.date}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                  {order?.yourVolume}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                  {order?.yourReferralVolume}
                </td>
                <td className="py-2.5 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                  {order?.totalRewardsTool}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <ResponsiveDataCard
        columns={[...LEGACY_REWARD_COLUMNS]}
        data={paginatedOrders || []}
        renderRow={(item) => <RenderRowData item={item} columns={[...LEGACY_REWARD_COLUMNS]} />}
      />
      {(rewardHistory?.length ?? 0) > 0 && (
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

export default LegacyRewardHistory
