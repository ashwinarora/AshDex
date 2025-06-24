'use client'

import { useFavorites } from '@/store/FavoritesStore'
import FavoriteItem from './FavoriteItem'
import useIsSpot from '@/hooks/useIsSpot'
import { ToggleGroup } from '../ui/toggle-group'
import { Separator } from '../ui/separator'

const FavoriteStrip = ({ setSelectedAsset }: { setSelectedAsset: (asset: string) => void }) => {
  const isSpot = useIsSpot()
  const { favorites } = useFavorites(isSpot)

  return (
    <div className="flex bg-secondary p-1 rounded-md w-full !h-10 overflow-hidden">
      <div className="flex w-fit items-center gap-4 overflow-x-auto no-scrollbar">
        <ToggleGroup
          type="single"
          className="flex items-center gap-2 h-full"
          onValueChange={setSelectedAsset}
        >
          {Array.from(favorites).map((favorite) => (
            <>
              <FavoriteItem assetKey={favorite} />
              <Separator orientation="vertical" className="!h-full last:hidden" />
            </>
          ))}
        </ToggleGroup>
      </div>
    </div>
    // <div className="relative flex bg-secondary px-1 pt-1 pb-2 rounded-md w-full h-fit overflow-hidden">
    //   <Splide
    //     aria-label="My Favorite Tokens"
    //     options={{
    //       drag: true,
    //       pagination: false,
    //       arrows: false,
    //       rewind: true,

    //       autoWidth: true
    //     }}
    //   >
    //     {Array.from(favorites).map((assetKey) => (
    //       <SplideSlide key={assetKey}>
    //         <FavoriteItem assetKey={assetKey} setSelectedAsset={setSelectedAsset} />
    //       </SplideSlide>
    //     ))}
    //   </Splide>
    // </div>
  )
}

export default FavoriteStrip
