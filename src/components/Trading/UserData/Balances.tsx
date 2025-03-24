import { useHyperLiquid } from '@/context/HyperLiquid'
import infoicon from '@/assets/images/info_icon.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'
import Image from 'next/image'

const Balances = () => {
  const { clearingHouseState } = useHyperLiquid()
  const columns = [
    { key: 'totalBalance', label: 'Total Balance' },
    { key: 'withdrawableBalance', label: 'Withdrawable Balance' },
    { key: 'send', label: 'Send' },
    { key: 'transfer', label: 'Transfer' }
  ]

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full text-white">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="pt-3 pb-1 px-7 text-sm font-normal text-[#8B8BA0] text-left"
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
          <tr>
            <td className="py-2 px-7 border-b border-gray-600 text-left">
              {clearingHouseState?.marginSummary.accountValue}
            </td>
            <td className="py-2 px-7 border-b border-gray-600 text-left">
              {clearingHouseState?.withdrawable}
            </td>
            <td className="py-2 px-7 border-b border-gray-600 text-left">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
                Send
              </button>
            </td>
            <td className="py-2 px-7 border-b border-gray-600 text-left">
              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded">
                Transfer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Balances
