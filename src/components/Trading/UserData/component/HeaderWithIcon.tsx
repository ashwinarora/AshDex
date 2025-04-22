'use client'
import infoicon from '@/assets/images/info_icon.svg'
import sorting_icon from '@/assets/images/shorting_icon.svg'
import Image from 'next/image'

const HeaderWithIcons = ({ label }: { label: string }) => (
  <div className="flex justify-start items-center gap-1">
    <Image src={sorting_icon} alt="Sort" width={12} height={12} className="cursor-pointer" />
    <span>{label}</span>
    <Image src={infoicon} alt="Info" width={16} height={16} className="cursor-pointer" />
  </div>
)

export default HeaderWithIcons
