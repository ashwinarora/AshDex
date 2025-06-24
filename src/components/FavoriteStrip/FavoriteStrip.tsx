'use client'

import { useFavorites } from '@/store/FavoritesStore'
import FavoriteItem from './FavoriteItem'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/react-splide/css'
import useIsSpot from '@/hooks/useIsSpot'
import { Toggle } from '../ui/toggle'
import { Separator } from '../ui/separator'
import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'

const FavoriteStrip = ({ setSelectedAsset }: { setSelectedAsset: (asset: string) => void }) => {
  const isSpot = useIsSpot()
  const { favorites } = useFavorites(isSpot)

  return (
    <div className="relative flex bg-secondary px-1 pt-1 pb-2 rounded-md w-full h-fit overflow-hidden">
      <Splide
        aria-label="My Favorite Tokens"
        options={{
          drag: true,
          pagination: false,
          arrows: false,
          rewind: true,

          autoWidth: true
        }}
      >
        {Array.from(favorites).map((assetKey) => (
          <SplideSlide key={assetKey}>
            <FavoriteItem assetKey={assetKey} setSelectedAsset={setSelectedAsset} />
          </SplideSlide>
        ))}
      </Splide>
    </div>
  )
}

export default FavoriteStrip
