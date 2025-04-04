import Image from 'next/image'
import VectorIcon from '@/assets/images/vector_icon.svg'
import React from 'react'

interface UnstakeItem {
  amount: string
  arrive: string
}
interface UnstakeItemProps {
  unstakeItems: UnstakeItem[]
}

const UnstakeQueue: React.FC<UnstakeItemProps> = ({ unstakeItems }) => {
  return (
    <div>
      <div
        className="flex  rounded-2xl border-2 border-white/10 justify-between
                p-4
                bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]
                backdrop-blur-[48.3px] items-center "
      >
        <span className="text-gray-400 text-base font-medium">Pending Total</span>
        <span className="text-white font-medium text-xl flex">
          <div className="bg-[#072723] p-1 rounded-full h-fit items-center">
            <Image src={VectorIcon} alt="" className="mt-0.5" />
          </div>
          12,382.28 HYPE
        </span>
      </div>
      <div className="mt-5">
        <div className="flex justify-between text-gray-400 text-sm pb-2">
          <span>Amount</span>
          <span>Arrive in</span>
        </div>
        {unstakeItems.map((item, index) => (
          <div
            key={index}
            className="flex justify-between py-3 border-b border-[#FFFFFF29] text-white"
          >
            <span>{item.amount}</span>
            <span>{item.arrive}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UnstakeQueue
