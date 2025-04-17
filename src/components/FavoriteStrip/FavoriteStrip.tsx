'use client'

import { useFavorites } from '@/context/FavoritesContext'
import FavoriteItem from './FavoriteItem'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll'
import '@splidejs/react-splide/css'

const FavoriteStrip = ({ type }: { type: 'spot' | 'perp' }) => {
  const { favorites } = useFavorites()

  if (favorites[type].length === 0) {
    return null
  }

  return (
    <div className="relative w-full overflow-hidden bg-[#0f081681] border-y border-white/5">
      <div className="w-24 h-full absolute left-0 top-0 z-10 bg-gradient-to-l from-transparent via-secondary via-50% to-secondary"></div>

      <Splide
        aria-label="My Favorite Tokens"
        options={{
          drag: true,
          type: 'loop',
          pagination: false,
          arrows: false,
          rewind: true,
          gap: 16,
          autoWidth: true,
          autoScroll: {
            autoStart: true,
            speed: 1
          }
        }}
        extensions={{ AutoScroll }}
      >
        {favorites[type].map((favorite, index) => (
          <SplideSlide key={index}>
            <FavoriteItem favorite={favorite} />
          </SplideSlide>
        ))}
      </Splide>

      <div className="w-24 h-full absolute right-0 top-0 z-10 bg-gradient-to-r from-transparent via-secondary via-50% to-secondary"></div>
    </div>
  )
}

export default FavoriteStrip
