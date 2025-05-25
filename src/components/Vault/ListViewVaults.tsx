'use client'
import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { VAULTS_LIST_COLUMNS } from '../../utils/constants'
import Pagination from '../common/Pagination'
import SparklineChart from '../common/SparklineChart'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import infoicon from '@/assets/images/info_icon.svg'
import sortingIcon from '@/assets/images/sorting_icon.svg'
import lidoicon from '../../assets/images/lido_icon.svg'

function ListViewVaults() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const data = Array.from({ length: 10 }, (_, i) => ({
    name: 'Lido',
    description: 'Liquidator no.',
    leader: '0xfc13...80c9',
    apr: '0.00%',
    totalFunds: '$18,190.73',
    yourDeposit: '$0.00',
    age: '731',
    snapshot: Array.from({ length: 10 }, () => Math.random() * 100),
    status: i % 3 === 0 ? 'Open' : 'Closed',
    deposit: 'Deposit'
  }))

  function StatusRenderer(params: { value: string }) {
    return (
      <span className="bg-[#28283d] text-[#2FA766] px-2 py-1 rounded-lg text-sm font-semibold">
        {params.value}
      </span>
    )
  }

  function ActionRenderer(params: { value: string }) {
    return (
      <div className="flex flex-col gap-y-2 lg:gap-y-1 xl:flex-row gap-x-2">
        {params.value === 'Open' ? (
          <>
            <button className="bg-white/10 py-2.5 cursor-pointer font-semibold text-sm rounded-xl px-3 lg:px-1 w-full">
              Top Up
            </button>
            <button className="bg-white/10 py-2.5 cursor-pointer font-semibold text-sm rounded-xl px-3 lg:px-1 w-full">
              Withdraw
            </button>
          </>
        ) : (
          <button className="bg-white/10 px-3 lg:px-1 py-2.5 cursor-pointer font-semibold rounded-xl text-sm w-full">
            Deposit
          </button>
        )}
      </div>
    )
  }

  type ColumnType = {
    key: string
    label: string
  }

  type RenderRowProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any
    columns: ColumnType[]
    index: number
    onRowClick: (index: number) => void
  }

  const handleRowClick = (index: number) => {
    router.push(`/vaults/${index}`)
  }

  const RenderRowData: React.FC<RenderRowProps> = ({ item, columns, index, onRowClick }) => {
    return (
      <div onClick={() => onRowClick(index)} className="flex flex-col gap-2 text-white text-sm">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Image src={lidoicon} alt="lidoicon" style={{ width: 30, height: 'auto' }} />
            <div className="flex flex-col">
              <span className="font-medium">{item?.name}</span>
              <span className="text-xs text-[#8B8BA0]">{item?.description}</span>
            </div>
          </div>
        </div>
        {columns
          ?.filter(
            (col) =>
              col?.key !== 'name' &&
              col?.key !== 'snapshot' &&
              col?.key !== 'status' &&
              col?.key !== 'actions'
          )
          ?.map((col) => (
            <div key={col?.key} className="flex justify-between">
              <span className="text-[#8B8BA0]">{col?.label}</span>
              {col?.key === 'totalFunds' ? (
                <span className="flex items-center gap-x-2">
                  {item?.totalFunds}{' '}
                  <span className="text-[#2FA766] pt-0.5 font-normal text-xs">{'+$190,73'}</span>
                </span>
              ) : (
                <span className={col?.key === 'contract' ? 'truncate' : ''}>
                  {item[col?.key] ?? '-'}
                </span>
              )}
            </div>
          ))}
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-x-12">
            <div className="flex flex-col gap-y-2">
              <span className="text-[#8B8BA0]">Snapshot</span>
              <div className="h-[15px] w-full">
                <SparklineChart data={item?.snapshot} />
              </div>
            </div>
            <div className="flex flex-col gap-y-2">
              <span className="text-[#8B8BA0]">Status</span>
              <StatusRenderer value={item?.status} />
            </div>
          </div>
          <ActionRenderer value={item?.status} />
        </div>
      </div>
    )
  }
  const totalPages = Math.ceil(data?.length / pageSize)
  const paginatedValuts = useMemo(() => {
    return data?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [, currentPage, pageSize])

  return (
    <>
      <div className="overflow-x-auto max-sm:px-3 w-full">
        <table className="w-full text-whit hidden lg:table">
          <thead>
            <tr>
              {VAULTS_LIST_COLUMNS?.map((col) => (
                <th
                  key={col?.key}
                  className="pt-3 pb-1 max-xl:px-7 pr-7 text-sm font-normal text-[#8B8BA0] text-left"
                >
                  <div className="flex justify-start items-center gap-1">
                    {col?.label ? (
                      <>
                        <Image
                          src={sortingIcon}
                          style={{ width: 12, height: 'auto' }}
                          alt="Sort"
                          className="w-3 h-3 cursor-pointer"
                        />
                        <span className="text-nowrap">{col?.label}</span>
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
            {paginatedValuts?.map((position, index) => (
              <tr
                onClick={() => handleRowClick(index)}
                key={index}
                className=" border-b border-white/10 cursor-pointer"
              >
                <td className="py-3 pr-7 text-white opacity-80 font-normal text-sm ">
                  <div className="flex items-center gap-1">
                    <Image
                      style={{ width: 30, height: 'auto' }}
                      src={lidoicon}
                      alt="Lidoicon"
                      className="mx-1 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      {position?.name}{' '}
                      <span className="text-[#8B8BA0] text-sm">{position?.description}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-7 opacity-80 text-white font-normal text-sm">
                  {position?.leader}
                </td>
                <td className="py-3 pr-7 opacity-80  text-white font-normal text-sm">
                  {position?.apr}
                </td>
                <td className="py-3 pr-7 opacity-80 text-white font-normal text-sm">
                  <div className="flex items-center space-x-2">
                    <p>{position?.totalFunds}</p>
                    <p className="text-[#2FA766]">${'+$190,73'}</p>
                  </div>
                </td>
                <td className="py-3 pr-7 opacity-80 text-white font-normal text-sm">
                  {position?.yourDeposit}
                </td>
                <td className="py-3 pr-7 opacity-80 text-white font-normal text-sm">
                  {position?.age}
                </td>
                <td className="py-3 pr-7 opacity-80 text-white font-normal text-sm">
                  <div className="h-[15px] w-16">
                    <SparklineChart data={position?.snapshot} />
                  </div>
                </td>
                <td className="py-3 pr-7 opacity-80 text-white font-normal text-sm">
                  <StatusRenderer value={position?.status} />
                </td>
                <td className="py-3 pr-7 opacity-80 text-white font-normal text-sm">
                  <ActionRenderer value={position?.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ResponsiveDataCard
          columns={[...VAULTS_LIST_COLUMNS]}
          data={paginatedValuts?.map((item, index) => ({ ...item, _index: index }))}
          renderRow={(item) => (
            <RenderRowData
              item={item}
              columns={[...VAULTS_LIST_COLUMNS]}
              index={item?._index}
              onRowClick={handleRowClick}
            />
          )}
        />
        {data?.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
    </>
  )
}

export default ListViewVaults
