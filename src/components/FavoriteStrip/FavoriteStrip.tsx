'use client'

import { useFavorites } from '@/context/FavoritesContext'
import FavoriteItem from './FavoriteItem'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/react-splide/css'
import useIsSpot from '@/hooks/useIsSpot'

const FavoriteStrip = ({ setSelectedAsset }: { setSelectedAsset: (asset: string) => void }) => {
  const { favorites } = useFavorites()
  const isSpot = useIsSpot()
  const type = isSpot ? 'spot' : 'perp'
  if (favorites[type].length === 0) {
    return null
  }

  return (
    <div className="relative bg-secondary rounded-lg w-full overflow-hidden">
      <Splide
        className=" "
        aria-label="My Favorite Tokens"
        options={{
          drag: true,
          pagination: false,
          arrows: false,
          rewind: true,
          gap: 4,
          autoWidth: true
        }}
      >
        {favorites[type].map((favorite, index) => (
          <SplideSlide key={index}>
            <FavoriteItem favorite={favorite} setSelectedAsset={setSelectedAsset} />
          </SplideSlide>
        ))}
      </Splide>

      <div className="top-0 right-0 z-10 absolute bg-gradient-to-r from-transparent via-50% via-secondary to-secondary w-12 xl:w-24 h-full"></div>
    </div>
  )
}

export default FavoriteStrip
