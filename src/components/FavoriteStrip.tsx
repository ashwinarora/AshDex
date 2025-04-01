'use client'
import Image from 'next/image'
import starticon from '@/assets/images/star_icon.svg'

const FavoriteStrip = () => {
  const baseFavorites = [
    { name: 'SHIB1000USDT', value: '+8.13%' },
    { name: 'ETHUSDT', value: '-8.13%' },
    { name: 'BTCUSDT', value: '+5.67%' },
    { name: 'ADAUSDT', value: '-2.45%' }
  ]
  const favorites = Array.from({ length: 15 }, (_, i) => baseFavorites[i % baseFavorites.length])
  const duplicatedFavorites = [...favorites, ...favorites]

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="flex items-center bg-[#140b21] px-4 py-2 border-2 border-transparent"
        style={{
          background: 'linear-gradient(90deg, #100C23 100%, rgba(16, 12, 35, 0) 77%)',
          borderImageSource:
            'linear-gradient(90.07deg, rgba(255, 255, 255, 0.02) -1.62%, rgba(135, 120, 246, 0.028) 98.82%)',
          borderImageSlice: 1
        }}
      >
        {/* Left Arrow */}
        {/* <RiArrowLeftSLine className="size-6 text-gray-400 cursor-pointer" /> */}

        {/* Scrolling Favorites */}
        <div className="marquee">
          <ul className="flex flex-row space-x-8 text-white overflow-hidden marquee-content">
            {duplicatedFavorites?.map((favorite, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Image src={starticon} alt="staricon" height={20} width={20} className="w-4 h-4" />
                <span className="font-medium text-sm text-[#E8E0F1]">{favorite?.name}</span>
                <span className={`text-[12px] text-gray-400`}>{favorite?.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side Controls */}
        <div className="flex flex-row items-center space-x-3">
          {/* <FaPlus className="text-[#8B8BA0] cursor-pointer" /> */}
          {/* <RiArrowRightSLine className="size-6 text-gray-400 cursor-pointer" /> */}
        </div>
      </div>
    </div>
  )
}

export default FavoriteStrip
