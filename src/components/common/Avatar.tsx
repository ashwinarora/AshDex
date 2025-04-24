// import { avataaarsNeutral } from '@dicebear/collection'
// import { botttsNeutral } from '@dicebear/collection'
import { glass } from '@dicebear/collection'
import { createAvatar } from '@dicebear/core'
import Image from 'next/image'

function Avatar({ avatar, className }: { avatar: string; className?: string }) {
  // const series = [glass, avataaarsNeutral, botttsNeutral] as const
  // //const seriesIndex = Math.floor(Number(avatar) / 15) % series.length

  return (
    <Image
      src={createAvatar(glass, {
        seed: avatar.toString(),
        size: 56,
        scale: 80
      }).toDataUri()}
      alt="avatar"
      className={`rounded-full ${className}`}
      width={56}
      height={56}
    />
  )
}

export default Avatar
