'use client'
import { cn } from '@/utils/utils'
import { ReactNode } from 'react'

interface ToggleGroupProps {
  children: ReactNode
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({ children }) => {
  return <div className={'flex flex-wrap gap-2'}>{children}</div>
}

interface ToggleGroupItemProps {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  className?: string
}

export const ToggleGroupItem: React.FC<ToggleGroupItemProps> = ({
  children,
  active,
  onClick,
  className
}) => {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded bg-gray-700 text-white',
        active ? 'bg-blue-600' : 'hover:bg-gray-600',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
