import React from 'react'
import Image from 'next/image'

type MemoizedIconProps = {
  src: string
  alt: string
  width: number
  height: number | string
  className?: string
}

const MemoizedIcon: React.FC<MemoizedIconProps> = React.memo(({
  src, 
  alt, 
  width, 
  height,
  className = ''
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={typeof height === 'string' ? width : height}
      className={className}
      priority
      loading="eager"
    />
  )
})

MemoizedIcon.displayName = 'MemoizedIcon'

export default MemoizedIcon
