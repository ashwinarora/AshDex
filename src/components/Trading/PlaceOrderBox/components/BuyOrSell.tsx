import React from 'react'

interface BuyOrSellProps {
  isBuy: boolean
  setIsBuy: (isBuy: boolean) => void
}

const BuyOrSell: React.FC<BuyOrSellProps> = ({ isBuy, setIsBuy }) => {
  return (
    <div className="flex p-1 m-3 rounded-md bg-white/5 ">
      <button
        className={`flex-1 text-center  py-1 font-bold  transition-colors cursor-pointer rounded-md text-sm duration-100 ${
          isBuy ? 'text-white  bg-green' : 'text-gray-300'
        }`}
        onClick={() => setIsBuy(true)}
      >
        Buy
      </button>
      <button
        className={`flex-1 text-center py-1  font-bold  transition-colors cursor-pointer rounded-md  text-sm duration-100 ${
          !isBuy ? 'text-white bg-red' : 'text-gray-300 '
        }`}
        onClick={() => setIsBuy(false)}
      >
        Sell
      </button>
    </div>
  )
}
export default BuyOrSell
