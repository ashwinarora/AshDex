import React from 'react'

interface BuyOrSellProps {
  isBuy: boolean
  setIsBuy: (isBuy: boolean) => void
}

const BuyOrSell: React.FC<BuyOrSellProps> = ({ isBuy, setIsBuy }) => {
  return (
    <div className="relative flex justify-between bg-white/5 m-3 p-1 py-3 rounded-md h-8 overflow-hidden">
      {/* Sliding background */}
      <div
        className={`absolute top-0 left-0 z-10 h-[100%]  w-1/2 rounded-md transition-all duration-200 ${
          isBuy ? 'translate-x-0 bg-green' : 'translate-x-full bg-red'
        }`}
      ></div>

      {/* Buy Button */}
      <p
        className="z-20 flex justify-center items-center w-1/2 font-medium text-white text-sm cursor-pointer"
        onClick={() => setIsBuy(true)}
      >
        Buy
      </p>

      {/* Sell Button */}
      <p
        className="z-20 flex justify-center items-center w-1/2 font-medium text-white text-sm cursor-pointer"
        onClick={() => setIsBuy(false)}
      >
        Sell
      </p>
    </div>
  )
}
export default BuyOrSell
