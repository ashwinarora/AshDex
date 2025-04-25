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
    <div className="relative w-full overflow-hidden bg-[#0f081681] border-y border-white/5">
      <div className="xl:w-24 w-12 h-full absolute left-0 top-0 z-10 bg-gradient-to-l from-transparent via-secondary via-50% to-secondary"></div>

      <Splide
        className="xl:mx-12 mx-8"
        aria-label="My Favorite Tokens"
        options={{
          drag: true,
          pagination: false,
          arrows: false,
          rewind: true,
          gap: 16,
          autoWidth: true
        }}
      >
        {favorites[type].map((favorite, index) => (
          <SplideSlide key={index}>
            <FavoriteItem favorite={favorite} setSelectedAsset={setSelectedAsset} />
          </SplideSlide>
        ))}
      </Splide>

      <div className="xl:w-24 w-12 h-full absolute right-0 top-0 z-10 bg-gradient-to-r from-transparent via-secondary via-50% to-secondary"></div>
    </div>
  )
}

export default FavoriteStrip
