import Image from 'next/image'
import { useAccount } from 'wagmi'
import WalletNotConnected from '@/components/common/WalletNotConnected'
import { BALANCE_FUTURES_COLUMNS, BALANCE_SPOT__COLUMNS } from '@/utils/constants'
import infoicon from '@/assets/images/info_icon.svg'
import sortingIcon from '@/assets/images/sorting_icon.svg'
import useIsSpot from '@/hooks/useIsSpot'
import { useEffect, useState } from 'react'
import TransferModal from './TransferModal'
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
  const isSpot = useIsSpot()
  const [isClient, setIsClient] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)

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

  const clearingHouseStateData = [
    {
      marginSummary: {
        accountValue: clearingHouseState?.marginSummary?.accountValue
      },
      withdrawable: clearingHouseState?.withdrawable
    }
  ]

  const sendButton = () => {
    return (
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
        Send
      </button>
    )
  }
  const transferButton = () => {
    return (
      <button
        className="bg-green-500 cursor-pointer hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
        onClick={() => setIsTransferModalOpen(!isTransferModalOpen)}
      >
        Transfer
      </button>
    )
  }

  const getColumnValue = (index: number) => {
    switch (index) {
      case 0:
        return clearingHouseStateData[0]?.marginSummary.accountValue ?? '-'
      case 1:
        return clearingHouseStateData[0]?.withdrawable ?? '-'
      case 2:
        return <span>{sendButton()}</span>
      case 3:
        return <span>{transferButton()}</span>
      default:
        return null
    }
  }
  const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
    return (
      <div className="flex flex-col gap-2 text-white text-sm">
        {columns?.map((col, index) => (
          <div key={col?.key} className="flex justify-between">
            <span className="text-[#8B8BA0]">{col?.label}</span>
            {isSpot ? (
              <span className={col?.key === 'contract' ? 'truncate' : ''}>
                {item[col?.key] ?? '-'}
              </span>
            ) : (
              <span className={'truncate'}>{getColumnValue(index)}</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (isSpot) {
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
            {spotState?.balances?.map((balance, index) => (
              <tr key={index} className=" border-b border-white/10">
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
                <td className="py-4 px-7  opacity-80 text-white font-medium text-sm">
                  {balance.entryNtl}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ResponsiveDataCard
          columns={[...BALANCE_SPOT__COLUMNS]}
          data={spotState?.balances || []}
          renderRow={(item) => <RenderRowData item={item} columns={[...BALANCE_SPOT__COLUMNS]} />}
        />
      </div>
    )
  }

  // Render clearingHouseState (when isSpot is false)
  return (
    <>
      <div className="overflow-x-auto w-full px-3 lg:px-4">
        <table className="w-full hidden lg:table text-white">
          <thead>
            <tr>
              {BALANCE_FUTURES_COLUMNS?.map((col) => (
                <th
                  key={col.key}
                  className="pt-3 pb-2.5 max-md:px-5 max-lg:pr-2 px-7 text-sm font-normal text-[#8B8BA0] text-left"
                >
                  <div className="flex justify-start items-center gap-1">
                    <Image
                      src={sortingIcon}
                      alt="Sort"
                      style={{ width: 12, height: 'auto' }}
                      className="w-3 h-3 cursor-pointer"
                    />
                    <span>{col.label}</span>
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
            <tr>
              <td className="py-2 px-7 border-b border-gray-600 text-left">
                {clearingHouseState?.marginSummary.accountValue}
              </td>
              <td className="py-2 px-7 border-b border-gray-600 text-left">
                {clearingHouseState?.withdrawable}
              </td>
              <td className="py-2 px-7 border-b border-gray-600 text-left">{sendButton()}</td>
              <td className="py-2 px-7 border-b border-gray-600 text-left">{transferButton()}</td>
            </tr>
          </tbody>
        </table>
        <ResponsiveDataCard
          columns={[...BALANCE_FUTURES_COLUMNS]}
          data={clearingHouseStateData || []}
          renderRow={(item) => <RenderRowData item={item} columns={[...BALANCE_FUTURES_COLUMNS]} />}
        />
        <TransferModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(!isTransferModalOpen)}
        />
      </div>
    </>
  )
}

export default Balances
