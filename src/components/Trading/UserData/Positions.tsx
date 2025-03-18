import { useHyperLiquid } from '@/context/HyperLiquid'
import React from 'react'

const Positions = () => {
  const { clearingHouseState } = useHyperLiquid()

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800 text-white text-left">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-700">Coin</th>
            <th className="py-2 px-4 border-b border-gray-700">Size</th>
            <th className="py-2 px-4 border-b border-gray-700">Position Value</th>
            <th className="py-2 px-4 border-b border-gray-700">Entry Price</th>
            <th className="py-2 px-4 border-b border-gray-700">Unrealized PnL</th>
            <th className="py-2 px-4 border-b border-gray-700">Liquidation Price</th>
            <th className="py-2 px-4 border-b border-gray-700">Margin</th>
            <th className="py-2 px-4 border-b border-gray-700">Funding</th>
          </tr>
        </thead>
        <tbody>
          {clearingHouseState?.assetPositions.map((pos, index) => {
            const position = pos.position
            return (
              <tr key={index}>
                <td className="py-2 px-4 border-b border-gray-700">{position.coin}</td>
                <td className="py-2 px-4 border-b border-gray-700">{position.szi}</td>
                <td className="py-2 px-4 border-b border-gray-700">{position.positionValue}</td>
                <td className="py-2 px-4 border-b border-gray-700">{position.entryPx}</td>
                <td className="py-2 px-4 border-b border-gray-700">{position.unrealizedPnl}</td>
                <td className="py-2 px-4 border-b border-gray-700">{position.liquidationPx || 'N/A'}</td>
                <td className="py-2 px-4 border-b border-gray-700">{position.marginUsed}</td>
                <td className="py-2 px-4 border-b border-gray-700">{position.cumFunding.sinceOpen}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Positions