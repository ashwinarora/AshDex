'use client'
import { useState } from 'react'
import Image from 'next/image'
import SparklineChart from '../common/SparklineChart'
import Pagination from '../common/Pagination'
import infoicon from '../../assets/images/info_icon.svg'
import lidoicon from '../../assets/images/lido_icon.svg'
import { useRouter } from 'next/navigation'

const vaults = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: 'Liquidator',
  leader: '0xfc13...80c9',
  apr: '0.00%',
  totalFunds: '$18,190.73',
  yourDeposit: '0.00%',
  age: '731',
  status: i % 3 === 0 ? 'Open' : 'Closed',
  snapshot: Array.from({ length: 15 }, () => Math.floor(Math.random() * 100))
}))

const BoardViewVaults = () => {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(vaults?.length / 10)
  const paginatedVaults = vaults?.slice((currentPage - 1) * 10, currentPage * 10)

  return (
    <div className=" text-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-5 cursor-pointer">
        {paginatedVaults?.map((vault) => (
          <div
            key={vault?.id}
            style={{
              background:
                'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
            }}
            onClick={() => router.push(`/vaults/${vault?.id}`)}
            className="border-[2px] border-white/10 backdrop-blur-[48.3px] p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            {/* Top - Total Funds */}
            <div className="flex pt-1 justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="mr-1 text-sm text-[#8B8BA0] font-medium">Total funds:</span>
                <div className="flex gap-x-1">
                  <span className="text-white text-sm font-normal">{vault.totalFunds}</span>
                  <span className="text-[#2FA766] text-sm font-normal">+${'190.73'}</span>
                </div>
              </div>
              <div className="h-2 flex items-center justify-end mb-3">
                <SparklineChart data={vault?.snapshot} />
              </div>
            </div>

            {/* Middle - Logo and Status */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-x-3">
                <Image height={35} width={35} src={lidoicon} alt="vault icon" />
                <div>
                  <p className="text-white text-md font-medium">{vault.name}</p>
                  <p className="text-sm font-normal text-[#8B8BA0]">Liquid staking</p>
                </div>
              </div>
              <span className="bg-[#28283d] text-[#2FA766] px-3 py-1 rounded-lg text-sm font-semibold">
                {vault.status}
              </span>
            </div>

            {/* Vault Info */}
            <div className="grid grid-cols-2 font-medium gap-y-2 text-sm text-[#8B8BA0] my-4">
              <div className="flex items-center gap-x-1">
                <p>APR:</p>
                <Image height={15} width={15} src={infoicon} alt="infoicon1" />
                <p className="ml-auto text-[#E8E0F1]">{vault.apr}</p>
              </div>
              <div className="flex justify-end items-center">
                <p>{vault.leader}</p>
              </div>
              <div className="flex items-center gap-x-1">
                <span>Age (days):</span>
                <Image height={15} width={15} src={infoicon} alt="infoicon2" />
                <span className="ml-4 text-[#E8E0F1]">{vault.age}</span>
              </div>
              <div className="flex items-center gap-x-1">
                <p>Your deposit:</p>
                <Image height={15} width={15} src={infoicon} alt="infoicon3" />
                <p className="ml-auto text-[#E8E0F1]">{vault.yourDeposit}</p>
              </div>
            </div>
            {/* Actions */}
            <div className="mt-5 flex gap-2">
              {vault?.status === 'Open' ? (
                <>
                  <button className="bg-white/10 py-2.5 cursor-pointer font-semibold text-sm rounded-xl px-3 w-full">
                    Top Up
                  </button>
                  <button className="bg-white/10 py-2.5 cursor-pointer font-semibold text-sm rounded-xl px-3 w-full">
                    Withdraw
                  </button>
                </>
              ) : (
                <button className="bg-white/10 px-3 py-2.5 cursor-pointer font-semibold rounded-xl text-sm w-full">
                  Deposit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  )
}

export default BoardViewVaults
