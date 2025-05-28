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
    <div className="relative flex w-full px-1 pt-1 pb-3 overflow-hidden rounded-md bg-secondary">
      <Splide
        className=""
        aria-label="My Favorite Tokens"
        options={{
          drag: true,
          pagination: false,
          arrows: false,
          rewind: true,

          autoWidth: true
        }}
      >
        {favorites[type].map((favorite, index) => (
          <SplideSlide key={index}>
            <FavoriteItem favorite={favorite} setSelectedAsset={setSelectedAsset} />
          </SplideSlide>
        ))}
      </Splide>
    </div>
  )
}

export default FavoriteStrip
