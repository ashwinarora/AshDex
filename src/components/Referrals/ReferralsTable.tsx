import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import Pagination from '@/components/common/Pagination'
import NoData from '@/components/common/NoData'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import { REFERRALS_COLUMNS } from '@/utils/constants'
import bitcoinicon from '@/assets/images/bitcoin_logo.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'

const ReferralsData = Array.from({ length: 10 }, (_, index) => ({
  address: '12d458f8we12...8we12d458f8we',
  dateJoined: '26.03.2025',
  totalVolume: '$5 000',
  feesPaid: '$0.123',
  yourRewards: '$4',
  id: index + 1
}))

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

  const totalPages = Math.ceil(ReferralsData?.length / pageSize)

  const paginatedBalance = useMemo(() => {
    return ReferralsData?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [ReferralsData, currentPage, pageSize])

  const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
    return (
      <div className="flex flex-col gap-2 text-white text-sm">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Image src={bitcoinicon} alt="BTC" width={30} height={30} />
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

  return (
    <>
      {isConnected ? (
        <div className="overflow-x-auto w-full px-3 lg:px-4">
          <table className="w-full hidden lg:table text-white">
            <thead>
              <tr>
                {REFERRALS_COLUMNS?.map((col) => (
                  <th
                    key={col.key}
                    className="pt-3 pb-2.5 max-xl:px-7 pr-7 text-sm font-normal text-[#8B8BA0] text-left"
                  >
                    <div className="flex justify-start items-center gap-1">
                      <Image src={shortingicon} alt="Sort" className="w-3 h-3 cursor-pointer" />
                      <span>{col.label}</span>
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
                            width={27}
                            height={27}
                            className="mx-1 cursor-pointer"
                          />
                          <div className="flex justify-between flex-col">{item?.address} </div>
                        </div>
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
                        {item?.dateJoined}
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
                        {item?.totalVolume}
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
                        {item?.feesPaid}
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
                        {item?.yourRewards}
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
      ) : (
        <NoData
          title="Your wallet is currently disconnected"
          description="Connect your wallet to access your balance, deposit funds, and manage your vaults."
        />
      )}
    </>
  )
}

export default ReferralsTable
