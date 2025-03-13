import { useHyperLiquid } from "@/context/HyperLiquid"

const Balances = () => {
  const { clearingHouseState } = useHyperLiquid()
  return (
    <div className="p-4 bg-gray-900 text-white">
      <table className="min-w-full bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-700">
          <tr>
            <th className="py-2 px-4 border-b border-gray-600 text-left">Total Balance</th>
            <th className="py-2 px-4 border-b border-gray-600 text-left">Withdrawable Balance</th>
            <th className="py-2 px-4 border-b border-gray-600 text-left">Send</th>
            <th className="py-2 px-4 border-b border-gray-600 text-left">Transfer</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-700">
            <td className="py-2 px-4 border-b border-gray-600 text-left">{clearingHouseState?.marginSummary.accountValue}</td>
            <td className="py-2 px-4 border-b border-gray-600 text-left">{clearingHouseState?.withdrawable}</td>
            <td className="py-2 px-4 border-b border-gray-600 text-left">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">Send</button>
            </td>
            <td className="py-2 px-4 border-b border-gray-600 text-left">
              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded">Transfer</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Balances