import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import Pagination from '../common/Pagination'
import Tooltip from '../common/Tooltip'
import {
  STAKE_TABS,
  STAKE_MYSTAKINGS_COLUMN,
  STAKE_ALLVALIDATORS_COLUMN,
  STAKE_SHOWINFOICON,
  STAKE_INITIAL_COLUMNS
} from '@/utils/constants'
import { getTooltipContent } from '@/utils/utils'
import stakesData from '@/utils/stake.json'
import DropDown from '@/assets/images/tabler_chevron-down.svg'
import infoicon from '@/assets/images/info_icon.svg'

type StakeType = 'My Stakings' | 'All Validators'
type SpecialColumnKeys = 'apy' | 'upTime' | 'globalApr' | 'fee'
type StakeTabId = 'simple' | 'advanced' | 'view' | 'period'

function StakingTable() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const { validatorTableData, myStakingTableData, allValidatorsTableData } = stakesData
  const [activeTab, setActiveTab] = useState<StakeTabId>('simple')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeType, setActiveType] = useState<StakeType>('My Stakings')
  const [columns, setColumns] = useState(STAKE_INITIAL_COLUMNS)
  const [rows, setRows] = useState(validatorTableData)
  const [isClient, setIsClient] = useState(false)
  const rowsPerPage = isConnected ? 5 : 10
  const totalPages = Math.ceil((rows?.length ?? 0) / rowsPerPage)

  const handleRowClick = (index: number) => {
    router.push(`/stake/stakeDetails?id=${index}`)
  }

  const getDynamicClass = useCallback((activeType: StakeType, activeTab: StakeTabId) => {
    const classes: Record<StakeType, Record<'simple' | 'advanced', string>> = {
      'My Stakings': {
        simple: 'w-[40%]',
        advanced: 'w-1/3'
      },
      'All Validators': {
        simple: 'w-1/3',
        advanced: 'w-[27%]'
      }
    }
    return classes[activeType]?.[activeTab as 'simple' | 'advanced'] || 'w-auto'
  }, [])

  const updateTableData = useCallback(() => {
    if (!isConnected) {
      setColumns(STAKE_INITIAL_COLUMNS)
      setRows(validatorTableData)
      return
    }
    const selectedColumns =
      activeType === 'My Stakings' ? STAKE_MYSTAKINGS_COLUMN : STAKE_ALLVALIDATORS_COLUMN
    const filteredColumns =
      activeTab === 'simple'
        ? selectedColumns.filter((col) => !['upTime', 'globalApr', 'fee'].includes(col.key))
        : [...selectedColumns]
    const updatedRows =
      activeType === 'My Stakings'
        ? myStakingTableData.map((item) => ({ ...item, totalStaked: item.yourStaked }))
        : allValidatorsTableData
    setColumns(filteredColumns)
    setRows(updatedRows)
  }, [isConnected, activeType, activeTab])

  const paginatedStaking = useMemo(() => {
    return rows?.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  }, [rows, currentPage])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    updateTableData()
  }, [updateTableData])

  if (!isClient) {
    return null
  }

  return (
    <div
      style={{
        background:
          'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
      }}
      className="mt-4 border-2 border-white/10 backdrop-blur-[40px] rounded-xl"
    >
      <div className="flex p-3 justify-between items-center">
        {isConnected ? (
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveType('My Stakings')}
              className={`px-3 text-sm cursor-pointer py-1.5 rounded-full transition-all ${
                activeType === 'My Stakings'
                  ? 'bg-white/10 font-semibold text-white backdrop-blur-lg'
                  : 'text-[#8B8BA0] font-medium hover:text-gray-300'
              }`}
            >
              My Stakings
            </button>
            <button
              onClick={() => setActiveType('All Validators')}
              className={`px-3 text-sm cursor-pointer py-1.5 rounded-full transition-all ${
                activeType === 'All Validators'
                  ? 'bg-white/10 font-semibold text-white backdrop-blur-lg'
                  : 'text-[#8B8BA0] font-medium hover:text-gray-300'
              }`}
            >
              All Validators
            </button>
          </div>
        ) : (
          <p className="text-white tracking-normal font-semibold text-base">Validators</p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 text-white text-sm">
          {STAKE_TABS?.map((item) => (
            <button
              key={item?.id}
              onClick={() => {
                if (item?.id === 'simple' || item?.id === 'advanced') {
                  setActiveTab(item?.id)
                }
              }}
              className={`px-3 text-sm cursor-pointer py-1.5 rounded-full transition-all ${
                activeTab === item?.id
                  ? 'bg-white/10 font-semibold text-white backdrop-blur-lg'
                  : 'text-[#8B8BA0] font-medium hover:text-gray-300'
              }`}
            >
              {item?.name}
            </button>
          ))}
          <Tooltip content={getTooltipContent('allTime')}>
            <button className="cursor-pointer font-semibold border-white/10 bg-white/10 rounded-2xl py-2.5 text-white px-4.5 text-sm flex justify-between items-center">
              <span>All Time</span>
              <Image src={DropDown} style={{ width: 20, height: 'auto' }} className="pl-1" alt="" />
            </button>
          </Tooltip>
        </div>
      </div>
      {/* table  */}
      <div className="my-3">
        <table className="w-full text-white">
          <thead>
            <tr>
              {columns?.map((col) => (
                <th
                  key={col.key}
                  className="pt-3 pb-3 px-3.5 text-sm font-normal text-[#8B8BA0] text-start"
                >
                  <div className="flex justify-start items-center gap-1">
                    <span>{col.label}</span>
                    {STAKE_SHOWINFOICON?.includes(col?.key as SpecialColumnKeys) && (
                      <Tooltip content={getTooltipContent(col?.key)}>
                        <Image
                          src={infoicon}
                          alt="Info"
                          style={{ width: 16, height: 'auto' }}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </Tooltip>
                    )}
                  </div>
                </th>
              ))}
              {isConnected && <th></th>}
            </tr>
          </thead>
          <tbody>
            {paginatedStaking?.map((item, index) => (
              <tr
                onClick={() => handleRowClick(index)}
                key={index}
                className="border-b cursor-pointer hover:bg-white/10  border-white/10"
              >
                <td
                  className={`py-3 ${isConnected ? getDynamicClass(activeType, activeTab) : 'w-1/2'} overflow-hidden px-3.5 opacity-80 text-white font-normal text-sm`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base text-white font-medium">{item.validator}</span>
                    {item.status && (
                      <span
                        className={`px-1.5 py-[3px] flex items-center tracking-tight text-sm font-semibold rounded-md ${
                          item.status === 'Active'
                            ? 'bg-[#213539] text-green'
                            : 'bg-[#422734] text-red'
                        }`}
                      >
                        {item.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#8B8BA0] mt-1">{item.description}</p>
                </td>
                {columns
                  ?.filter((col) => col?.key !== 'validator')
                  ?.map((col) => (
                    <td
                      key={col.key}
                      className="py-3 px-3.5 opacity-80 text-white font-normal text-sm"
                    >
                      {item[col.key as keyof typeof item]}
                    </td>
                  ))}
                {isConnected && (
                  <td className="py-3 px-3.5">
                    <span className="font-semibold w-[75%] px-4 border-white/10 bg-white/10 rounded-xl py-2.5 text-white text-sm flex justify-center items-center">
                      {'Stake'}
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {rows && rows?.length > 0 && (
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

export default StakingTable
