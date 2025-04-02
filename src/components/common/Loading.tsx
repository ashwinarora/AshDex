import React from 'react'
import Image from 'next/image'
import { cn } from '@/utils/utils'
import nexonlogo from '../../assets/images/logo.svg'

interface LoadingProps {
  title: string
  subTitle: string
  className: string
}

const Loading: React.FC<LoadingProps> = ({ title, subTitle, className }) => {
  return (
    <div className={cn('flex justify-center items-center w-full flex-col', className)}>
      <div className="w-16 h-16">
        <Image src={nexonlogo} alt="Nexon Logo" width={64} height={64} />
      </div>
      <div className="w-[60%]">
        <p className="mt-8 text-white font-medium text-base text-center">{title ?? ''}</p>
        <p className="mt-2 text-[#8B8BA0] font-medium text-sm text-center">{subTitle ?? ''}</p>
      </div>
    </div>
  )
}

export default Loading
