'use client'

import { useFavorites } from '@/store/FavoritesStore'
import FavoriteItem from './FavoriteItem'
import useIsSpot from '@/hooks/useIsSpot'
import { ToggleGroup } from '../ui/toggle-group'
import { Separator } from '../ui/separator'
import { Fragment } from 'react'
import { IconStar } from '@tabler/icons-react'

const FavoriteStrip = ({ setSelectedAsset }: { setSelectedAsset: (asset: string) => void }) => {
  const isSpot = useIsSpot()
  const { favorites } = useFavorites(isSpot)

  if (favorites.size === 0) {
    return (
      <div className="flex items-center gap-2 justify-center bg-secondary p-1 rounded-md w-full !h-10 overflow-hidden">
        <IconStar className="size-3 text-white/20" />
        <p className="text-white/20 text-sm">No token added to favorites</p>
      </div>
    )
  }

  return (
    <div className="flex bg-secondary p-1 rounded-md w-full !h-10 overflow-hidden">
      <div className="flex w-fit items-center gap-4 overflow-x-auto no-scrollbar">
        <ToggleGroup
          type="single"
          className="flex items-center gap-2 h-full"
          onValueChange={(asset) => {
            console.log('asset', asset)
            setSelectedAsset(asset)
          }}
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
