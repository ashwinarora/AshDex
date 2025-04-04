import Image from 'next/image'
import React, { useMemo, useState } from 'react'
import SearchIcon from '@/assets/images/search_normal.svg'
import CheckBox from '../common/CheckBox'
import shortingicon from '@/assets/images/shorting_icon.svg'
import Pagination from '../common/Pagination'

const columns = [
  { key: 'time', label: 'Time' },
  { key: 'action', label: 'Action' },
  { key: 'status', label: 'Status' },
  { key: 'amountChange', label: 'Amount Change' }
]

interface ActionHistoryData {
  time: string
  action: string
  status: string
  amountChange: string
}
interface ActionsHistoryProps {
  actionHistoryData: ActionHistoryData[]
}

const ActionsHistory: React.FC<ActionsHistoryProps> = ({ actionHistoryData }) => {
  const [show, setShow] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil((actionHistoryData?.length ?? 0) / 10)

  const paginatedPositions = useMemo(() => {
    return actionHistoryData?.slice((currentPage - 1) * 10, currentPage * 10)
  }, [actionHistoryData, currentPage])

  return (
    <div className="space-y-4">
      <div>
        <div
          className="flex  rounded-2xl border-2 border-white/10 justify-between
                    p-4
                    bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]
                    backdrop-blur-[48.3px] items-center"
        >
          <div className="flex gap-x-3 items-center w-full">
            <Image src={SearchIcon} alt="" />
            <input
              type="text"
              placeholder="Search..."
              className="w-[100%] focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <CheckBox label="Show auto-compounding" setIsChecked={setShow} isChecked={show} />
        <button className="text-sm text-[#7D67FF] font-medium">Export as CSV</button>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-white">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="pt-3 pb-1 md:px-0 px-7 text-sm font-normal text-[#8B8BA0] text-left"
                >
                  <div className="flex justify-start items-center gap-1">
                    {col.label === 'Time' && (
                      <Image
                        src={shortingicon}
                        alt="Sort"
                        height={16}
                        width={16}
                        className="w-3 h-3 cursor-pointer"
                      />
                    )}
                    <span>{col.label}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedPositions?.map((position, index) => (
              <tr key={index} className=" border-b border-white/10">
                <td className="py-4 md:px-0 px-7 opacity-80 text-[#8B8BA0] font-normal text-sm">
                  {position.time}
                </td>
                <td className="py-4 opacity-80 md:px-0 px-7 text-[#FFFFFF] font-normal text-sm">
                  {position.action === 'Reward' ? (
                    <div>
                      {position.action}
                      <p className="text-base font-medium text-[#8B8BA0]">auto-compound</p>
                    </div>
                  ) : (
                    position.action
                  )}
                </td>
                <td className="py-4 md:px-0 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                  <span
                    className={`font-semibold bg-[#1F1F30] p-1 rounded-[8px] ${position.status === 'Success' ? 'text-green-500' : 'text-white'}`}
                  >
                    {position.status}
                  </span>
                </td>
                <td className="py-4 md:px-0 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                  {position.amountChange}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {actionHistoryData && actionHistoryData?.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  )
}

export default ActionsHistory
