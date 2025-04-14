import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Pagination from '../common/Pagination'
import lendBorrowData from '@/utils/lendBorrow.json'
import infoicon from '@/assets/images/info_icon.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'
import bitcoinicon from '@/assets/images/bitcoin_logo.svg'

const columns = [
  { key: 'name', label: 'Name & Ticker' },
  { key: 'supplies', label: 'Supplies' },
  { key: 'supplyapy', label: 'Supply APY' },
  { key: 'borrowed', label: 'Borrowed' },
  { key: 'borrowapy', label: 'Borrow APY' }
]

const MarketTable = () => {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const { tableData } = lendBorrowData?.lendBorrow
  const totalPages = Math.ceil(tableData?.length / pageSize)

  const handleRowClick = (index: number) => {
    router.push(`/lendBorrow/lendBorrowDetails?id=${index}`)
  }

  const paginatedPositions = useMemo(() => {
    return tableData?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [currentPage, pageSize])

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-white">
        <thead>
          <tr>
            {columns?.map((col) => (
              <th
                key={col?.key}
                className="pt-3 pb-1 pr-7 text-sm font-normal text-[#8B8BA0] text-left"
              >
                <div className="flex justify-start items-center gap-1">
                  <Image
                    src={shortingicon}
                    alt="Sort"
                    height={16}
                    width={16}
                    className="w-3 h-3 cursor-pointer"
                  />
                  <span>{col?.label}</span>
                  <Image
                    src={infoicon}
                    alt="Info"
                    height={16}
                    width={16}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedPositions?.map((position, index) => (
            <tr
              key={index}
              className=" border-b border-white/10 cursor-pointer"
              onClick={() => handleRowClick(index)}
            >
              <td className="py-4 pr-7 text-[#FFFFFF] opacity-80 font-normal text-sm ">
                <div className="flex items-center gap-1">
                  <Image src={bitcoinicon} alt="Bitcoin" className="w-6 h-6 mx-1 cursor-pointer" />
                  <div className="flex flex-col">
                    {position?.coin}{' '}
                    <span className="text-[#8B8BA0] text-sm">{position?.coin}</span>
                  </div>
                </div>
              </td>
              <td className="py-4 pr-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                <div className="flex space-x-2">
                  <div>
                    <p className="text-base">{position?.entryPx}</p>
                    <span className="bg-[#4a4a4d] p-0.5 rounded-md">16%</span>
                  </div>
                  <div className="relative group">
                    <button className="bg-[#FFFFFF0F] text-base font-medium px-3 py-2 rounded-md">
                      Supply
                    </button>
                    <span className="hidden group-hover:block absolute left-1/2 transform -translate-x-1/2 -top-8 bg-[#000000] text-white text-xs rounded-xl p-7 w-[10vw] border-2 border-[#FFFFFF0F]">
                      Your wallet does not have a ezETH balance on the Linea network.
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-4 pr-7 opacity-80  text-[#FFFFFF] font-normal text-sm">
                {position?.entryPx}
              </td>
              <td className="py-4 pr-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                <div className="flex space-x-2">
                  <div>
                    <p className="text-base">{position?.cumFunding?.allTime}</p>
                    <span className="bg-[#4a4a4d] p-0.5 rounded-md">16%</span>
                  </div>
                  <div className="relative group">
                    <button className="bg-[#FFFFFF0F] text-base font-medium px-3 py-2 rounded-md">
                      Borrow
                    </button>
                    <span className="hidden group-hover:block absolute left-1/2 transform -translate-x-1/2 rounded-xl -top-8 bg-secondary text-white text-xs p-7 w-[10vw] border-2 border-[#FFFFFF0F]">
                      Maximum amount available to borrow is 9.9 k ezETH ($24.4 mn)
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-4 pr-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                <span className="relative group">
                  <span className="">{position?.szi}</span>
                  <span className="hidden group-hover:block absolute left-1/2 transform -translate-x-1/2 -top-8 bg-secondary text-white text-xs rounded-xl p-7 w-[10vw] border-2 border-[#FFFFFF0F]">
                    <span>Participating in this ezETH reserve gives annualized rewards.</span>
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tableData?.length > 0 && (
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

export default MarketTable
