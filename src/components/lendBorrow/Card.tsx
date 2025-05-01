import Image from 'next/image'
import React from 'react'
import InfoIcon from '@/assets/images/info_icon.svg'
import ChartIcon from '@/assets/images/chart_icon.svg'
import WalletIcon from '@/assets/images/wallet_icon_2.svg'
import BankIcon from '@/assets/images/mdi_bank.svg'
import lendBorrowData from '@/utils/lendBorrow.json'

const iconMap: { [key: string]: string } = {
  chart_icon: ChartIcon,
  wallet_icon_2: WalletIcon,
  mdi_bank: BankIcon
}

interface CardItemProps {
  icon: string
  title: string
  value: string
  change: string
  changeColor: string
}

const CardItem: React.FC<CardItemProps> = ({ icon, title, value, change, changeColor }) => (
  <div
    className="rounded-2xl flex items-center shadow-md border-2 border-white/10 backdrop-blur-[40px] p-3.5"
    style={{
      background:
        'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
    }}
  >
    <div className="rounded-md border border-white/10 bg-[#FFFFFF0F] px-3 py-2.5 flex justify-center">
      <Image
        src={iconMap[icon]}
        style={{ width: 20, height: 'auto' }}
        alt={title}
        className="w-5 h-5"
      />
    </div>
    <div className="px-2.5">
      <div className="flex items-center gap-1">
        <span className="text-[#8B8BA0] text-base font-medium">{title}</span>
        <Image
          src={InfoIcon}
          alt="Info"
          style={{ width: 16, height: 'auto' }}
          className="w-4 h-4 cursor-pointer"
        />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-white text-[30px] font-medium">{value}</span>
        <p className="text-base text-[#8B8BA0]">
          <span className={changeColor}>{change}</span> 24h
        </p>
      </div>
    </div>
  </div>
)

const Card = () => {
  return (
    <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-3">
      {lendBorrowData?.lendBorrow?.cardData?.map((card, index) => (
        <CardItem key={index} {...card} />
      ))}
    </div>
  )
}

export default Card
