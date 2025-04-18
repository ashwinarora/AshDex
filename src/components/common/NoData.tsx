'use client'
import Image from 'next/image'
import { useWalletModal } from '@/context/WalletModalContext'
import noordericon from '@/assets/images/noorder_icon.svg'

type NoDataProps = {
  title: string
  description?: string
  type?: string
}

const NoData = ({ title, description, type }: NoDataProps) => {
  const { toggleConnectWalletModal } = useWalletModal()
  return (
    <div className="flex my-8 max-[1025px]:pt-0 pt-7 flex-col text-center justify-center items-center w-full">
      <Image
        src={noordericon}
        width={90}
        height={90}
        alt={title}
        className="h-[93px] w-[93px] max-[770px]:w-[70px] max-[770px]:h-[70px]"
      />
      <span className="font-medium text-center mt-2.5 text-base text-[#FFFFFF]">{title}</span>
      {description && (
        <p className="text-[#8B8BA0] text-sm mt-1.5 mb-2 font-normal max-w-[300px]">
          {description}
        </p>
      )}
      {type !== 'Referrals' && (
        <button
          onClick={toggleConnectWalletModal}
          className="2xl:px-[20px] max-[770px]:mt-1 mt-5 px-[11px] flex items-center py-[10px] bg-[#5F46F9] font-bold text-[#FFFFFF] text-sm rounded-md md:rounded-xl cursor-pointer"
        >
          {'Connect Wallet'}
        </button>
      )}
    </div>
  )
}

export default NoData
