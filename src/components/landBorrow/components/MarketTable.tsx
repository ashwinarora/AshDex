import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import Pagination from '../../common/Pagination'
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

const mockData = Array.from({ length: 20 }, (_, i) => ({
  position: {
    coin: `BTC/USDT ${i + 1}`,
    entryPx: (40000 + i * 100).toFixed(2),
    markPx: (40500 + i * 100).toFixed(2),
    cumFunding: { allTime: (i * 0.005).toFixed(5) },
    szi: (0.1 + i * 0.02).toFixed(2),
    unrealizedPnl: ((i - 10) * 5).toFixed(2),
    liquidationPx: (38000 + i * 100).toFixed(2),
    leverage: { value: i % 2 === 0 ? '10x' : '5x' }
  }
}))

const MarketTable = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const totalPages = Math.ceil(mockData.length / pageSize)

  const paginatedPositions = useMemo(() => {
    return mockData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [currentPage, pageSize])
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-white">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
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
                  <span>{col.label}</span>
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
            <tr key={index} className=" border-b border-white/10">
              <td className="py-4 pr-7 text-[#FFFFFF] opacity-80 font-normal text-sm ">
                <div className="flex items-center gap-1">
                  <Image src={bitcoinicon} alt="Bitcoin" className="w-6 h-6 mx-1 cursor-pointer" />
                  <div className="flex flex-col">
                    {position.position.coin}{' '}
                    <span className="text-[#8B8BA0] text-sm">{position.position.coin}</span>
                  </div>
                </div>
              </td>
              <td className="py-4 pr-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                <div className="flex space-x-2">
                  <div>
                    <p className="text-base">{position.position.entryPx}</p>
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
                {position.position.entryPx}
              </td>
              <td className="py-4 pr-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                <div className="flex space-x-2">
                  <div>
                    <p className="text-base">{position.position.cumFunding.allTime}</p>
                    <span className="bg-[#4a4a4d] p-0.5 rounded-md">16%</span>
                  </div>
                  <div className="relative group">
                    <button className="bg-[#FFFFFF0F] text-base font-medium px-3 py-2 rounded-md">
                      Borrow
                    </button>
                    <span className="hidden group-hover:block absolute left-1/2 transform -translate-x-1/2 rounded-xl -top-8 bg-[#0F0816] text-white text-xs p-7 w-[10vw] border-2 border-[#FFFFFF0F]">
                      Maximum amount available to borrow is 9.9 k ezETH ($24.4 mn)
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-4 pr-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                <span className="relative group">
                  <span className="">{position.position.szi}</span>
                  <span className="hidden group-hover:block absolute left-1/2 transform -translate-x-1/2 -top-8 bg-[#0F0816] text-white text-xs rounded-xl p-7 w-[10vw] border-2 border-[#FFFFFF0F]">
                    <span>Participating in this ezETH reserve gives annualized rewards.</span>
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {mockData.length > 0 && (
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
