import React from 'react';

interface BuyOrSellProps {
  isBuy: boolean;
  setIsBuy: (isBuy: boolean) => void;
}

const BuyOrSell: React.FC<BuyOrSellProps> = ({ isBuy, setIsBuy }) => {
  return (
    <div className="flex border-b border-gray-300 mb-4">
      <button
        className={`flex-1 text-center py-2 font-medium transition-colors ${isBuy
          ? 'text-blue-500 border-b-2 border-blue-500'
          : 'text-gray-300 hover:text-blue-500'
          }`}
        onClick={() => setIsBuy(true)}
      >
        BUY
      </button>
      <button
        className={`flex-1 text-center py-2 font-medium transition-colors ${!isBuy
          ? 'text-blue-500 border-b-2 border-blue-500'
          : 'text-gray-300 hover:text-blue-500'
          }`}
        onClick={() => setIsBuy(false)}
      >
        SELL
      </button>
    </div>
  )
}

export default BuyOrSell