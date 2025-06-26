'use client'

import { useFavorites } from '@/store/FavoritesStore'
import FavoriteItem from './FavoriteItem'
import useIsSpot from '@/hooks/useIsSpot'
import { ToggleGroup } from '../ui/toggle-group'
import { Separator } from '../ui/separator'
import { Fragment } from 'react'

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
            <Fragment key={favorite}>
              <FavoriteItem assetKey={favorite} />
              <Separator orientation="vertical" className="!h-full last:hidden" />
            </Fragment>
          ))}
        </ToggleGroup>
      </div>
    </div>
  )
}

export default FavoriteStrip
