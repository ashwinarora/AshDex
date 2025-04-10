import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { TWAP_VAULTS_COLUMNS } from '@/utils/constants'
import Pagination from '@/components/common/Pagination'
import infoicon from '@/assets/images/info_icon.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'
import bitcoinicon from '@/assets/images/bitcoin_logo.svg'

export const vaultsTwap = Array.from({ length: 10 }, (_, index) => {
  const coins = ['Bitcoin', 'Binance Coin', 'Shiba Inu', 'Ethereum']
  const symbols = ['BTC', 'BNB', 'SHIB', 'ETH']
  return {
    id: index + 1,
    vid: index + 1,
    coin: coins[index % coins?.length],
    symbol: symbols[index % symbols?.length],
    size: '1.5 BTC',
    executedSize: '0.75 BTC',
    averagePrice: '$42,500',
    runningTime: '30m / 60m',
    reduceOnly: Math.random() > 0.5 ? 'Yes' : 'No'
  }
})

function Twap() {
  const pathname = usePathname()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getOrdersLength(pathname: string, vaultsTwap?: any[]): number {
    if (pathname?.includes('/vaults')) {
      return vaultsTwap?.length || 0
    } else {
      return 0
    }
  }
  const totalPages = Math.ceil(getOrdersLength(pathname, vaultsTwap) / pageSize)
  const getColumnsByPathname = (pathname: string) => {
    if (pathname?.includes('/vaults')) {
      return TWAP_VAULTS_COLUMNS
    } else {
      return []
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDataByPathname = (pathname: string, vaultsTwap?: any[]) => {
    if (pathname?.includes('/vaults')) {
      return vaultsTwap
    } else {
      return []
    }
  }

  const data = useMemo(() => getDataByPathname(pathname, vaultsTwap), [pathname, vaultsTwap])

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
                  <td className="py-2 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-semibold text-sm">
                    <div className="flex items-center gap-x-1">
                      <Image
                        src={bitcoinicon}
                        alt="Bitcoin"
                        width={27}
                        height={27}
                        className="mx-1 cursor-pointer"
                      />
                      <div className="flex justify-between flex-col">
                        {order?.coin}{' '}
                        <span className="text-[#8B8BA0] pt-0.5 font-normal text-xs">
                          {order?.symbol}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {order?.size}
                  </td>
                  <td className="py-2 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {order?.executedSize}
                  </td>
                  <td className="py-2 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {order?.averagePrice}
                  </td>
                  <td className="py-2 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {order?.runningTime}
                  </td>
                  <td className="py-2 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                    <span
                      className={`${order?.reduceOnly === 'Yes' ? 'text-[#2FA766] bg-[#1F1F30]' : 'text-[#E2464A] bg-[#1F1F30]'}  ml-1 px-1.5 py-1 rounded-lg  font-semibold text-sm`}
                    >
                      {order?.reduceOnly}
                    </span>
                  </td>
                  <td className="py-2 pr-7 max-[1025px]:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    <button className="bg-white/10 px-6 flex justify-center py-2.5 cursor-pointer font-semibold rounded-xl text-sm w-1/2">
                      Terminate
                    </button>
                  </td>
                </tr>
              )
            } else {
              return <></>
            }
          })}
        </tbody>
      </table>
      {vaultsTwap?.length > 0 && (
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

export default Twap
