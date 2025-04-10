'use client'
import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { VAULTS_LIST_COLUMNS } from '../../utils/constants'
import Pagination from '../common/Pagination'
import SparklineChart from '../common/SparklineChart'
import infoicon from '@/assets/images/info_icon.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'
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
      <div className="flex gap-x-2">
        {params.value === 'Open' ? (
          <>
            <button className="bg-white/10 py-2.5 cursor-pointer font-semibold text-sm rounded-xl px-1 w-full">
              Top Up
            </button>
            <button className="bg-white/10 py-2.5 cursor-pointer font-semibold text-sm rounded-xl px-1 w-full">
              Withdraw
            </button>
          </>
        ) : (
          <button className="bg-white/10 px-1 py-2.5 cursor-pointer font-semibold rounded-xl text-sm w-full">
            Deposit
          </button>
        )}
      </div>
    )
  }

  const handleRowClick = (index: number) => {
    router.push(`/vaults/${index}`)
  }

  const totalPages = Math.ceil(data?.length / pageSize)
  const paginatedValuts = useMemo(() => {
    return data?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [, currentPage, pageSize])

  return (
    <>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-white">
          <thead>
            <tr>
              {VAULTS_LIST_COLUMNS?.map((col) => (
                <th
                  key={col?.key}
                  className="pt-3 pb-1 max-[1025px]:px-7 pr-7 text-sm font-normal text-[#8B8BA0] text-left"
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
            {paginatedValuts?.map((position, index) => (
              <tr
                onClick={() => handleRowClick(index)}
                key={index}
                className=" border-b border-white/10 cursor-pointer"
              >
                <td className="py-3 pr-7 text-[#FFFFFF] opacity-80 font-normal text-sm ">
                  <div className="flex items-center gap-1">
                    <Image
                      width={30}
                      height={30}
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
                <td className="py-3 pr-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                  {position?.leader}
                </td>
                <td className="py-3 pr-7 opacity-80  text-[#FFFFFF] font-normal text-sm">
                  {position?.apr}
                </td>
                <td className="py-3 pr-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                  <div className="flex items-center space-x-2">
                    <p>{position?.totalFunds}</p>
                    <p className="text-[#2FA766]">${'+$190,73'}</p>
                  </div>
                </td>
                <td className="py-3 pr-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                  {position?.yourDeposit}
                </td>
                <td className="py-3 pr-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                  {position?.age}
                </td>
                <td className="py-3 pr-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                  <div className="h-[15px] w-16">
                    <SparklineChart data={position?.snapshot} />
                  </div>
                </td>
                <td className="py-3 pr-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                  <StatusRenderer value={position?.status} />
                </td>
                <td className="py-3 pr-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                  <ActionRenderer value={position?.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
