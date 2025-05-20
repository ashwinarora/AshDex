'use client'
import infoicon from '@/assets/images/info_icon.svg'
import sorting_icon from '@/assets/images/sorting_icon.svg'
import MemoizedIcon from './MemoizedIcon'

const HeaderWithIcons = ({ label }: { label: string }) => (
  <div className="flex justify-start items-center gap-1">
    <MemoizedIcon
      src={sorting_icon}
      alt="Sort"
      width={12}
      height="auto"
      className="cursor-pointer"
    />
      <span>{label}</span>
    <MemoizedIcon
      src={infoicon}
      alt="Info"
      width={16}
      height="auto"
      className="cursor-pointer"
    />
  </div>
)

export default HeaderWithIcons
