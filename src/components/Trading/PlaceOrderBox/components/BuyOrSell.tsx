import React from 'react'

interface BuyOrSellProps {
  isBuy: boolean
  setIsBuy: (isBuy: boolean) => void
}

const BuyOrSell: React.FC<BuyOrSellProps> = ({ isBuy, setIsBuy }) => {
  return (
    <div className="flex border-b border-[#FFFFFF0F] mb-4 px-4">
      <button
        className={`flex-1 text-center border-b-4 py-2 font-medium transition-colors cursor-pointer ${
          isBuy ? 'text-white  border-primary' : 'text-gray-300 border-transparent'
        }`}
        onClick={() => setIsBuy(true)}
      >
        BUY
      </button>
      <button
        className={`flex-1 text-center py-2 border-b-4 font-medium transition-colors cursor-pointer ${
          !isBuy ? 'text-white border-primary' : 'text-gray-300  border-transparent'
        }`}
        onClick={() => setIsBuy(false)}
      >
        SELL
      </button>
    </div>
  )
}

export default BuyOrSell
