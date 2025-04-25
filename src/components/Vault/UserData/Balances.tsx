import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import Pagination from '@/components/common/Pagination'
import WalletNotConnected from '@/components/common/WalletNotConnected'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import { BALANCE_VAULTS_COLUMNS } from '@/utils/constants'
import bitcoinicon from '@/assets/images/bitcoin_logo.svg'
import infoicon from '@/assets/images/info_icon.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'

const vaultsBalance = Array.from({ length: 10 }, (_, index) => ({
  coin: 'Bitcoin',
  symbol: 'BTC',
  totalBalance: '0.512 BTC',
  availableBalance: '0.1 BTC',
  usdc: '$4,500.00',
  pnl: '+$80 (2.0%)',
  contract: '0xA12b...34cD',
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

const Balances = () => {
  const { isConnected } = useAccount()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.ceil(vaultsBalance?.length / pageSize)

  const paginatedBalance = useMemo(() => {
    return vaultsBalance?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [vaultsBalance, currentPage, pageSize])

  const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
    return (
      <div className="flex flex-col gap-2 text-white text-sm">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Image src={bitcoinicon} alt="BTC" width={30} height={30} />
            <div className="flex flex-col">
              <span className="font-medium">{item?.coin}</span>
              <span className="text-xs text-[#8B8BA0]">{item?.symbol}</span>
            </div>
          </div>
        </div>
        {columns
          ?.filter((col) => col?.key !== 'coin')
          ?.map((col) => (
            <div key={col?.key} className="flex justify-between">
              <span className="text-[#8B8BA0]">{col?.label}</span>
              <span
                className={
                  col?.key === 'pnl'
                    ? 'text-[#2FA766] font-medium'
                    : col?.key === 'contract'
                      ? 'truncate'
                      : ''
                }
              >
                {item[col?.key] ?? '-'}
              </span>
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
                {BALANCE_VAULTS_COLUMNS?.map((col) => (
                  <th
                    key={col.key}
                    className="pt-3 pb-2.5 max-xl:px-7 pr-7 text-sm font-normal text-[#8B8BA0] text-left"
                  >
                    <div className="flex justify-start items-center gap-1">
                      <Image src={shortingicon} alt="Sort" className="w-3 h-3 cursor-pointer" />
                      <span>{col.label}</span>
                      <Image src={infoicon} alt="Info" className="w-4 h-4 cursor-pointer" />
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
                      <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-semibold text-sm">
                        <div className="flex items-center gap-x-1">
                          <Image
                            src={bitcoinicon}
                            alt="Bitcoin"
                            width={27}
                            height={27}
                            className="mx-1 cursor-pointer"
                          />
                          <div className="flex justify-between flex-col">
                            {item?.coin}{' '}
                            <span className="text-[#8B8BA0] pt-0.5 font-normal text-xs">
                              {item?.symbol}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
                        {item?.totalBalance}
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
                        {item?.availableBalance}
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
                        {item?.usdc}
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
                        <span className="text-[#2FA766]">{item?.pnl}</span>
                      </td>
                      <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
                        {item?.contract}
                      </td>
                    </tr>
                  )
                })}
              </>
            </tbody>
          </table>
          <ResponsiveDataCard
            columns={[...BALANCE_VAULTS_COLUMNS]}
            data={paginatedBalance}
            renderRow={(item) => (
              <RenderRowData item={item} columns={[...BALANCE_VAULTS_COLUMNS]} />
            )}
          />
          {vaultsBalance?.length > 0 && (
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
        <WalletNotConnected
          title="Your wallet is currently disconnected"
          description="Connect your wallet to access your balance, deposit funds, and manage your vaults."
        />
      )}
    </>
  )
}

export default Balances
