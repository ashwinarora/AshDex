import React from 'react'

export type SkeletonSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | '8xl'
  | '9xl'
  | '10xl'
  | 'full'

interface SkeletonProps {
  size?: SkeletonSize
  color?: string
  className?: string
}

const sizeClasses: Record<SkeletonSize, string> = {
  sm: 'h-4 w-12',
  md: 'h-4 w-16',
  lg: 'h-4 w-20',
  xl: 'h-4  w-24',
  '2xl': 'h-4  w-28',
  '3xl': 'h-4  w-32',
  '4xl': 'h-4  w-36',
  '5xl': 'h-4  w-40',
  '6xl': 'h-4  w-44',
  '7xl': 'h-4  w-48',
  '8xl': 'h-4  w-52',
  '9xl': 'h-4  w-56',
  '10xl': 'h-4  w-60',
  full: 'h-full w-full'
}

const Skeleton: React.FC<SkeletonProps> = ({
  size = 'md',
  color = 'bg-white/10',
  className = ''
}) => {
  return (
    <div
      className={`
        animate-pulse 
        rounded
        ${color}
        ${sizeClasses[size]}
        ${className}
      `}
    />
  )
}

export default Skeleton
