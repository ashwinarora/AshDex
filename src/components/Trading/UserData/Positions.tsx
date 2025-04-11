import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useHyperLiquid } from '@/context/HyperLiquid'
import Pagination from '../../common/Pagination'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import editicon from '@/assets/images/edit_icon.svg'
import infoicon from '@/assets/images/info_icon.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'
import bitcoinicon from '@/assets/images/bitcoin_logo.svg'

const columns = [
  { key: 'coin', label: 'Position' },
  { key: 'entryPx', label: 'Entry Price' },
  { key: 'markPx', label: 'Mark Price' },
  { key: 'fundingPnl', label: 'Funding P&L' },
  { key: 'size', label: 'Size' },
  { key: 'unrealizedPnl', label: 'Unrealized PnL' },
  { key: 'liquidationPx', label: 'Liq. Price' },
  { key: 'marginUsed', label: 'Margin' },
  { key: 'status', label: 'Status' }
]

type ColumnType = {
  key: string
  label: string
}

type RenderRowProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  columns: ColumnType[]
}

const Positions = () => {
  const pathname = usePathname()
  const isVaults = pathname.includes('/vaults')
  const { clearingHouseState } = useHyperLiquid()
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil((clearingHouseState?.assetPositions?.length ?? 0) / 10)

  const paginatedPositions = useMemo(() => {
    return clearingHouseState?.assetPositions?.slice((currentPage - 1) * 10, currentPage * 10)
  }, [clearingHouseState?.assetPositions, currentPage])

  const RenderRowData: React.FC<RenderRowProps> = ({ item }) => {
    return (
      <div className="flex flex-col gap-2 text-white text-sm">
        <div className="flex justify-between">
          <div className="flex items-center gap-1">
            <span className={`w-[4px] h-[30px] rounded-sm ${'bg-[#2FA766]'}`}></span>
            <Image src={bitcoinicon} alt="Bitcoin" className="w-6 h-6 mx-1 cursor-pointer" />
            {item?.position?.coin}{' '}
            <span className="text-[#7D67FF] ml-1 px-1.5 py-1 rounded-lg bg-[#5F46F91A] font-semibold text-xs">
              {item?.position?.leverage?.value}
            </span>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B8BA0]">Entry Price</span>{' '}
          <span className="text-sm font-medium">{item?.position?.entryPx}</span>{' '}
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B8BA0]">Mark Price</span>{' '}
          <span className="text-sm font-medium">{item?.position?.entryPx}</span>{' '}
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B8BA0]">Funding P&L</span>{' '}
          <span className="text-sm font-medium">{item?.position?.cumFunding?.allTime}</span>{' '}
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B8BA0]">Size</span>{' '}
          <span className="text-sm font-medium">{item?.position?.szi}</span>{' '}
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B8BA0]">Unrealized PnL</span>{' '}
          <span className="text-sm font-medium">{item?.position?.unrealizedPnl}</span>{' '}
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B8BA0]">Liq. Price</span>{' '}
          <span className="text-sm text-[#E2464A] font-medium">
            {item?.position?.liquidationPx}
          </span>{' '}
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B8BA0]">Margin</span>{' '}
          <span className="text-sm font-medium">{item?.position?.liquidationPx}</span>{' '}
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B8BA0]">Status</span>{' '}
          <span className="bg-[#1F1F30] text-sm font-medium text-[#2FA766] px-1.5 py-0.5 rounded-lg">
            {'Open'}
          </span>{' '}
        </div>
        <div className="flex justify-between gap-1">
          <div className="flex font-medium items-center text-[#7D67FF] text-sm">
            <span className="pr-3 py-2">Market</span>
            <span className="px-3 py-2">Limit</span>
          </div>
          <div className="flex items-center">
            <span className="px-3 py-1 text-sm bg-[#322944] ml-2 text-white bg-opacity-10 border-2 border-white/10 border-opacity-10 rounded-md">
              dummy
            </span>
            <span className="px-3 text-sm py-1.5 bg-[#322944] ml-2 text-white bg-opacity-10 border-2 border-white/10 border-opacity-10 rounded-md">
              dummy
            </span>
          </div>
        </div>
        <div className="flex justify-between gap-1">
          <span className="text-[#8B8BA0]">TP/SL for position</span>
          <span>
            {true ? (
              <div className="flex items-center gap-x-1">
                <span className="w-17 break-words overflow-hidden">Dummy</span>
                <Image src={editicon} alt="Edit" className="w-4 h-4 cursor-pointer" />
              </div>
            ) : (
              '-/-'
            )}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full hidden lg:table text-white">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="pt-3 pb-1 px-7 text-sm font-normal text-[#8B8BA0] text-left"
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
            <th className="pt-3 pb-1 px-7 text-left text-sm font-normal text-[#7D67FF]">
              Close all positions
            </th>
            <th className="pt-3 pb-1 pl-2 pr-10 text-left text-sm font-normal text-[#8B8BA0]">
              <div className="flex justify-start items-center gap-1">
                <Image
                  src={shortingicon}
                  alt="Sort"
                  height={16}
                  width={16}
                  className="w-3 h-3 cursor-pointer"
                />
                <span>{'TP/SL for position'}</span>
                <Image
                  src={infoicon}
                  alt="Info"
                  height={16}
                  width={16}
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedPositions?.map((position, index) => (
            <tr key={index} className=" border-b border-white/10">
              <td className="py-4 px-7 text-[#FFFFFF] opacity-80 font-normal text-sm ">
                <div className="flex items-center gap-1">
                  <span
                    // fix later
                    className={`w-[4px] h-[36px] rounded-sm ${
                      index % 2 === 0 ? 'bg-[#E2464A]' : 'bg-[#2FA766]'
                    }`}
                  ></span>
                  <Image src={bitcoinicon} alt="Bitcoin" className="w-6 h-6 mx-1 cursor-pointer" />
                  {position.position.coin}{' '}
                  <span className="text-[#7D67FF] ml-1 px-1 py-1 rounded-lg bg-[#5F46F91A] font-semibold text-sm">
                    {position.position.leverage.value}
                  </span>
                </div>
              </td>
              <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                {position.position.entryPx}
              </td>
              <td className="py-4 px-7 opacity-80  text-[#FFFFFF] font-normal text-sm">
                {position.position.entryPx}
              </td>
              <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                {position.position.cumFunding.allTime}
              </td>
              <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                {position.position.szi}
              </td>
              <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                {position.position.unrealizedPnl}
              </td>
              <td className="py-4 px-7 opacity-80 text-[#E2464A] font-normal text-sm">
                {position.position.liquidationPx}
              </td>
              <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                {position.position.liquidationPx}
              </td>
              <td className="py-4 px-7 opacity-80 text-[#FFFFFF] ">
                <span className="bg-[#1F1F30] font-medium text-sm px-2 py-1 text-[#2FA766] rounded-lg">
                  Open
                </span>
              </td>
              <td className="py-4 opacity-80 text-[#7D67FF] text-sm px-7">
                <span className="px-3 font-medium py-2 mr-2">Market</span>
                <span className="px-3 font-medium py-2">Limit</span>
                <span className="px-3 py-2 text-sm bg-[#322944] ml-2 text-white bg-opacity-10 border-2 border-white/10 border-opacity-10 rounded-md">
                  dummy
                </span>
                <span className="px-3 text-sm py-2 bg-[#322944] ml-2 text-white bg-opacity-10 border-2 border-white/10 border-opacity-10 rounded-md">
                  dummy
                </span>
              </td>
              <td className="py-4 opacity-80 text-[#FFFFFF] font-normal text-sm px-7">
                {true ? (
                  <div className="flex items-center gap-2">
                    <span className="w-17 break-words overflow-hidden">Dummy</span>
                    <Image src={editicon} alt="Edit" className="w-4 h-4 cursor-pointer" />
                  </div>
                ) : (
                  '-/-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isVaults && (
        <ResponsiveDataCard
          columns={[...columns]}
          data={paginatedPositions || []}
          positionTab={true}
          renderRow={(item) => <RenderRowData item={item} columns={[...columns]} />}
        />
      )}
      {clearingHouseState?.assetPositions && clearingHouseState?.assetPositions?.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}

export default Positions
