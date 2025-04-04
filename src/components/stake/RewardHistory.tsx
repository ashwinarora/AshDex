import React, { useMemo, useState } from 'react'
import Pagination from '../common/Pagination'

interface RewardHistoryItem {
  time: string
  amount: string
}
interface RewardHistoryProps {
  RewardHistoryData: RewardHistoryItem[]
}
const RewardHistory: React.FC<RewardHistoryProps> = ({ RewardHistoryData }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const totalPages = Math.ceil((RewardHistoryData?.length ?? 0) / pageSize)

  const columns = [
    { key: 'time', label: 'Time' },
    { key: 'amount', label: 'Amount' }
  ]

  const paginatedPositions = useMemo(() => {
    return RewardHistoryData?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [RewardHistoryData, currentPage, pageSize])

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div
          className="flex  rounded-2xl border-2 border-white/10 justify-between
                p-4
                bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]
                backdrop-blur-[48.3px] w-[80%] items-center"
        >
          <span className="text-gray-400 text-base font-medium">Earned in Total</span>
          <span className="text-white font-medium text-xl flex">382.28 HYPE</span>
        </div>
        <button className="text-sm text-[#7D67FF] font-medium">Export as CSV</button>
      </div>

      <div>
        <div className="flex justify-between text-gray-400 text-sm pb-2 border-b border-white/10 px-4">
          {columns.map((col) => (
            <span key={col.key}>{col.label}</span>
          ))}
        </div>

        <div className="divide-y divide-white/10">
          {paginatedPositions.map((data, index) => (
            <div key={index} className="flex justify-between items-center px-4 py-3">
              {columns.map((col) => (
                <span key={col.key} className="text-white opacity-80 text-sm">
                  {data[col.key as keyof RewardHistoryItem]}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {RewardHistoryData && RewardHistoryData?.length > 0 && (
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

export default RewardHistory
