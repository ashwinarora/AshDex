import Image from 'next/image'
import React from 'react'
import ChartIcon from '@/assets/images/chart_icon.svg'
import infoicon from '@/assets/images/info_icon.svg'

const Card = () => {
  return (
    <div className="w-full px-14 bg-[#0d021f] py-5 grid grid-cols-3 space-x-3">
      <div
        className=" my-0 rounded-2xl max-[1100px]:block flex items-center shadow-md border-2 border-white/10 backdrop-blur-[40px] p-3.5"
        style={{
          background:
            'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
        }}
      >
        <div className="rounded-md border border-white/10 bg-white/10 outline-none px-3 py-2.5 flex justify-between">
          <Image src={ChartIcon} alt="" height={10} width={10} className="w-5 h-5" />
        </div>
        <div className="px-2.5">
          <div className="flex justify-start items-center gap-1">
            <span className="text-[#8B8BA0] text-base font-medium">Total Market Size</span>
            <Image
              src={infoicon}
              alt="Info"
              height={16}
              width={16}
              className="w-4 h-4 cursor-pointer"
            />
          </div>
          <div className="flex justify-start items-center gap-1">
            <span className="text-white text-[30px] font-medium">$242.41 Mn</span>
            <p className="text-base text-[#8B8BA0]">
              <span className="text-[#2FA766]">+ $2.41</span> 24h
            </p>
          </div>
        </div>
      </div>
      <div
        className="my-0 rounded-2xl max-[1100px]:block flex items-center shadow-md border-2 border-white/10 backdrop-blur-[40px] p-3.5"
        style={{
          background:
            'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
        }}
      >
        <div className="rounded-md border border-white/10 bg-white/10 outline-none px-3 py-2.5 flex justify-between">
          <Image src={ChartIcon} alt="" height={10} width={10} className="w-5 h-5" />
        </div>
        <div className="px-2.5">
          <div className="flex justify-start items-center gap-1">
            <span className="text-[#8B8BA0] text-base font-medium">Total Available</span>
            <Image
              src={infoicon}
              alt="Info"
              height={16}
              width={16}
              className="w-4 h-4 cursor-pointer"
            />
          </div>
          <div className="flex justify-start items-center gap-1">
            <span className="text-white text-[30px] font-medium">$242.41 Mn</span>
            <p className="text-base text-[#8B8BA0]">
              <span className="text-[#2FA766]">+ $2.41</span> 24h
            </p>
          </div>
        </div>
      </div>
      <div
        className="my-0 rounded-2xl max-[1100px]:block flex items-center shadow-md border-2 border-white/10 backdrop-blur-[40px] p-3.5"
        style={{
          background:
            'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
        }}
      >
        <div className="rounded-md border border-white/10 bg-white/10 outline-none px-3 py-2.5 flex justify-between">
          <Image src={ChartIcon} alt="" height={10} width={10} className="w-5 h-5" />
        </div>
        <div className="px-2.5">
          <div className="flex justify-start items-center gap-1">
            <span className="text-[#8B8BA0] text-base font-medium">Total Market Size</span>
            <Image
              src={infoicon}
              alt="Info"
              height={16}
              width={16}
              className="w-4 h-4 cursor-pointer"
            />
          </div>
          <div className="flex justify-start items-center gap-1">
            <span className="text-white text-[30px] font-medium">$242.41 Mn</span>
            <p className="text-base text-[#8B8BA0]">
              <span className="text-[#2FA766]">+ $2.41</span> 24h
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Card
