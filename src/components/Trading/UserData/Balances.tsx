import Image from 'next/image'
import { useAccount } from 'wagmi'
import WalletNotConnected from '@/components/common/WalletNotConnected'
import { BALANCE_SPOT__COLUMNS } from '@/utils/constants'
import infoicon from '@/assets/images/info_icon.svg'
import sortingIcon from '@/assets/images/sorting_icon.svg'
import { useEffect, useState } from 'react'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import { useHyperliquid } from '@/store/HyperliquidStore'

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
  const { clearingHouseState, spotState } = useHyperliquid()
  const [isClient, setIsClient] = useState(false)

  // Use useEffect to set isClient to true after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // During server-side rendering and initial client render, show a placeholder
  if (!isClient) {
    return <div className="overflow-x-auto w-full px-3 lg:px-4 h-40"></div>
  }

  if (!isConnected) {
    return <WalletNotConnected />
  }

  // Create combined data array
  const combinedData = [
    {
      coin: 'USDC(Perps)',
      token: 'USDC',
      total: clearingHouseState?.marginSummary?.accountValue || '-',
      hold: clearingHouseState?.withdrawable || '-',
      entryNtl: '-'
    },
    ...(spotState?.balances.map(state => {
      const coinName = state.coin === "USDC" ? "USDC(Spot)" : state.coin
      return {
        ...state,
        coin: coinName.replace('PERP', 'SPOT'),
      }
    }) || [])
  ]

  const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
    return (
      <div className="flex flex-col gap-2 text-white text-sm">
        {columns?.map((col) => (
          <div key={col?.key} className="flex justify-between">
            <span className="text-[#8B8BA0]">{col?.label}</span>
            <span className={col?.key === 'contract' ? 'truncate' : ''}>
              {item[col?.key] ?? '-'}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full hidden lg:table text-white">
        <thead>
          <tr>
            {BALANCE_SPOT__COLUMNS?.map((col) => (
              <th
                key={col?.key}
                className="pt-3 pb-1 px-7 text-sm font-normal text-[#8B8BA0] text-left"
              >
                <div className="flex justify-start items-center gap-1">
                  <Image
                    src={sortingIcon}
                    alt="Sort"
                    style={{ width: 12, height: 'auto' }}
                    className="w-3 h-3 cursor-pointer"
                  />
                  <span>{col?.label}</span>
                  <Image
                    src={infoicon}
                    alt="Info"
                    style={{ width: 16, height: 'auto' }}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {combinedData?.map((balance, index) => (
            <tr key={index} className="border-b border-white/10">
              <td className="py-4 px-7 opacity-80 text-white font-medium text-sm">
                {balance.coin}
              </td>
              <td className="py-4 px-7 opacity-80 text-white font-medium text-sm">
                {balance.token}
              </td>
              <td className="py-4 px-7 opacity-80 text-white font-medium text-sm">
                {balance.total}
              </td>
              <td className="py-4 px-7 opacity-80 text-white font-medium text-sm">
                {balance.hold}
              </td>
              <td className="py-4 px-7 opacity-80 text-white font-medium text-sm">
                {balance.entryNtl}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ResponsiveDataCard
        columns={[...BALANCE_SPOT__COLUMNS]}
        data={combinedData}
        renderRow={(item) => <RenderRowData item={item} columns={[...BALANCE_SPOT__COLUMNS]} />}
      />
    </div>
  )
}

export default Balances
