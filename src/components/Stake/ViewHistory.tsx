import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import CheckBox from '../common/CheckBox'
import Pagination from '../common/Pagination'
import { STAKE_VIEWHISTORY_COLUMN } from '../../utils/constants'
import stake from '@/utils/stake.json'
import LaftArrow from '@/assets/images/arrow_laft.svg'
import SearchIcon from '@/assets/images/search_normal.svg'
import sortingIcon from '@/assets/images/sorting_icon.svg'

type ViewHistoryProps = {
  setIsViewHistory?: (value: boolean) => void
}
const ViewHistory: React.FC<ViewHistoryProps> = ({ setIsViewHistory }) => {
  const { actionHistoryData } = stake
  const [show, setShow] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil((actionHistoryData?.length ?? 0) / 10)

  const handleBackClick = () => {
    setIsViewHistory?.(false)
  }

  const paginatedPositions = useMemo(() => {
    return actionHistoryData?.slice((currentPage - 1) * 10, currentPage * 10)
  }, [actionHistoryData, currentPage])

  return (
    <div>
      <div onClick={() => handleBackClick()} className="flex items-center space-x-3 cursor-pointer">
        <Image src={LaftArrow} style={{ width: 18, height: 'auto' }} alt="Back" />
        <span className="text-base font-medium">Back</span>
      </div>
      <div
        style={{
          background:
            'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
        }}
        className="mt-4 border-2 p-3 border-white/10 backdrop-blur-[40px] rounded-xl"
      >
        <div className="flex py-3 justify-between items-center">
          <p className="text-white tracking-normal font-semibold text-base">
            Staking Actions History
          </p>
          <div className="flex items-center gap-x-3">
            <div
              className="flex rounded-md border-2 border-white/10 justify-between
                                p-2
                                bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]
                                backdrop-blur-[48.3px] items-center"
            >
              <div className="flex gap-x-2 items-center w-full">
                <Image src={SearchIcon} style={{ width: 18, height: 'auto' }} alt="SearchIcon" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-[100%] text-sm focus:outline-none focus:ring-0"
                />
              </div>
            </div>
            <CheckBox label="Show auto-compounding" setIsChecked={setShow} isChecked={show} />
            <button className="text-sm px-4 py-2.5 rounded-2xl bg-primary text-white font-semibold">
              Export as CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto mb-3 w-full">
          <table className="w-full text-white">
            <thead>
              <tr>
                {STAKE_VIEWHISTORY_COLUMN?.map((col) => (
                  <th
                    key={col.key}
                    className="pt-2.5 pb-1 md:px-0 px-7 text-sm font-normal text-[#8B8BA0] text-start"
                  >
                    <div className="flex justify-start items-center gap-1">
                      {col.label === 'Time' && (
                        <Image
                          src={sortingIcon}
                          alt="Sort"
                          style={{ width: 16, height: 'auto' }}
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
                  <td className="py-3.5 md:px-0 px-7 text-white font-medium text-sm">
                    {position.time}
                  </td>
                  <td className="py-3.5 opacity-80 md:px-0 px-7 text-white font-medium text-sm">
                    {show && position.action === 'Reward' ? (
                      <div>
                        {position.action}
                        <p className="text-base font-medium text-[#8B8BA0]">auto-compound</p>
                      </div>
                    ) : (
                      position.action
                    )}
                  </td>
                  <td className="py-3.5 md:px-0 px-7 opacity-80 text-white font-normal text-sm">
                    <span className="text-base text-white font-medium">{position.validator}</span>
                    <p className="text-sm text-[#8B8BA0] mt-0.5">{position.description}</p>
                  </td>
                  <td className="py-3.5 md:px-0 px-7 opacity-80 text-white font-normal text-sm">
                    <span
                      className={`font-medium  p-1.5 rounded-[8px] ${position.status === 'Success' ? 'text-green bg-[#213539]' : 'text-white bg-[#50505e]'}`}
                    >
                      {position.status}
                    </span>
                  </td>
                  <td className="py-3.5 md:px-0 px-7 opacity-80 text-white font-normal text-sm">
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
    </div>
  )
}

export default ViewHistory
