import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import Pagination from '@/components/common/Pagination'
import WalletNotConnected from '@/components/common/WalletNotConnected'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import { REFERRALS_COLUMNS } from '@/utils/constants'
import bitcoinicon from '@/assets/images/bitcoin_logo.svg'
import sortingIcon from '@/assets/images/sorting_icon.svg'
import { useReferralsInfo } from '@/hooks/useReferralsInfo'

type ColumnType = {
  key: string
  label: string
}

type RenderRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  columns: ColumnType[]
}

const ReferralsTable = () => {
  const { isConnected } = useAccount()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data: referrals } = useReferralsInfo()

  const ReferralsData = useMemo(() => {
    if (referrals?.referrerState.stage !== 'ready') return []
    return referrals?.referrerState.data.referralStates
  }, [referrals])

  const totalPages = Math.ceil(ReferralsData?.length / pageSize)

  const paginatedBalance = useMemo(() => {
    if (referrals?.referrerState.stage !== 'ready') return []
    return ReferralsData?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [ReferralsData, currentPage, pageSize])

  const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
    return (
      <div className="flex flex-col gap-2 text-white text-sm">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Image src={bitcoinicon} alt="BTC" style={{ width: 30, height: 'auto' }} />
            <div className="flex flex-col">
              <span className="font-medium">{item?.coin}</span>
              <span className="text-sm text-[#FFFFFF]">{item?.address}</span>
            </div>
          </div>
        </div>
        {columns
          ?.filter((col) => col?.key !== 'address')
          ?.map((col) => (
            <div key={col?.key} className="flex justify-between">
              <span className="text-[#8B8BA0]">{col?.label}</span>
              <span>{item[col?.key] ?? '-'}</span>
            </div>
          ))}
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center mt-30 max-xl:my-30 min-2xl:mt-30">
        <WalletNotConnected type="Referrals" />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto w-full px-3 lg:px-4">
      <table className="w-full hidden lg:table text-white">
        <thead>
          <tr>
            {REFERRALS_COLUMNS?.map((col) => (
              <th
                key={col?.key}
                className="pt-3 pb-2.5 max-xl:px-7 pr-7 text-sm font-normal text-[#8B8BA0] text-start"
              >
                <div className="flex justify-start items-center gap-1">
                  <Image
                    src={sortingIcon}
                    alt="Sort"
                    style={{ width: 12, height: 'auto' }}
                    className="w-3 h-3 cursor-pointer"
                  />
                  <span>{col?.label}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <>
            {paginatedBalance?.map((item, index) => {
              return (
                <tr key={index} className="cursor-pointer border-b border-white/10">
                  <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
                    <div className="flex items-center gap-x-1">
                      <Image
                        src={bitcoinicon}
                        alt="Bitcoin"
                        style={{ width: 27, height: 'auto' }}
                        className="mx-1 cursor-pointer"
                      />
                      <div className="flex justify-between flex-col">{item?.user} </div>
                    </div>
                  </td>
                  <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {new Date(item?.timeJoined || '0').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </td>
                  <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {item?.cumRewardedFeesSinceReferred}
                  </td>
                  <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {item?.cumFeesRewardedToReferrer}
                  </td>
                  <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
                    {item?.cumVlm}
                  </td>
                </tr>
              )
            })}
          </>
        </tbody>
      </table>
      <ResponsiveDataCard
        columns={[...REFERRALS_COLUMNS]}
        data={paginatedBalance}
        renderRow={(item) => <RenderRowData item={item} columns={[...REFERRALS_COLUMNS]} />}
      />
      {ReferralsData?.length > 0 && (
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

export default ReferralsTable
