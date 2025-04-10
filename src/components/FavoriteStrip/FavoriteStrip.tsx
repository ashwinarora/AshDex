'use client'

import { useFavorites } from '@/context/FavoritesContext'
import FavoriteItem from './FavoriteItem'

const FavoriteStrip = () => {
  const { favorites } = useFavorites()

  // Only generate duplicated favorites if there are actually favorites to show
  const duplicatedFavorites =
    favorites.length > 0
      ? [
          ...Array.from({ length: 15 }, (_, i) => favorites[i % favorites.length]),
          ...Array.from({ length: 15 }, (_, i) => favorites[i % favorites.length])
        ]
      : []

  // If no favorites, show nothing or placeholder
  if (favorites.length === 0) {
    return null // Or return a placeholder/empty state
  }

  return (
    <div className="relative w-full overflow-hidden bg-[#0f081681] border-y border-white/5">
      <div className="w-24 h-full absolute left-0 top-0 z-10 bg-gradient-to-l from-transparent via-secondary via-50% to-secondary"></div>
      <div className="flex items-center justify-center     py-2 border-2 border-transparent min-h-[3rem]">
        <div className="marquee flex-1 flex items-center">
          <ul className="flex flex-row space-x-8 text-white overflow-hidden marquee-content items-center">
            {duplicatedFavorites.map((favorite, index) => (
              <li
                key={index}
                className="flex items-center justify-center h-full text-sm cursor-pointer"
              >
                <FavoriteItem favorite={favorite} />
              </li>
            ))}
          </ul>
        </div>

        <div className="w-24 h-full absolute right-0 top-0 z-10 bg-gradient-to-r from-transparent via-secondary via-50% to-secondary"></div>
      </div>
    </div>
  )
}

export default FavoriteStrip
