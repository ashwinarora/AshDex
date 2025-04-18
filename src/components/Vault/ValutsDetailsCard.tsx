'use client'
import Image from 'next/image'
import infoicon from '../../assets/images/info_icon.svg'

type ValutsDetailsProps = {
  title: string
  value: string
}

export const ValutsDetailsCard: React.FC<ValutsDetailsProps> = ({ title, value }) => {
  return (
    <div className="bg-gradient-to-b flex max-sm:items-center max-sm:justify-between max-sm:flex-row flex-col  max-sm:w-full max-lg:w-[23%] text-center from-white/5 via-gray-400/5 border-2 border-white/10 backdrop-blur-[48px] max-sm:px-4 max-sm:py-2 px-6 py-3 rounded-xl">
      <div className="flex justify-center items-center mb-1.5 gap-x-1">
        <p className="text-[#8B8BA0] text-sm font-medium">{title}</p>
        <Image
          className="opacity-80 cursor-pointer w-[15px] h-[15px] max-sm:w-[25px] max-sm:h-[25px]"
          src={infoicon}
          alt="infoicon"
          width={15}
          height={15}
        />
      </div>
      <p className="text-white max-sm:text-base flex items-center justify-center gap-x-2 font-medium text-2xl">
        {value}
      </p>
    </div>
  )
}
