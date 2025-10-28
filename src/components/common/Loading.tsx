import React from 'react'
import { cn } from '@/lib/utils'
import { IconLoader } from '@tabler/icons-react'

interface LoadingProps {
  title: string
  subTitle: string
  className: string
}

const Loading: React.FC<LoadingProps> = ({ title, subTitle, className }) => {
  return (
    <div className={cn('flex justify-center items-center w-full flex-col gap-4', className)}>
      <IconLoader className="size-10 animate-spin" />
      <div className="flex flex-col gap-2">
        <p className="text-white font-medium text-base text-center">{title ?? ''}</p>
        <p className=" text-white/70 font-medium text-sm text-center">{subTitle ?? ''}</p>
      </div>
    </div>
  )
}

export default Loading
