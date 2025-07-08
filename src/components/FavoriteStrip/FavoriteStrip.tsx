'use client'

import { useFavorites } from '@/store/FavoritesStore'
import FavoriteItem from './FavoriteItem'
import useIsSpot from '@/hooks/useIsSpot'
import { ToggleGroup } from '../ui/toggle-group'
import { Separator } from '../ui/separator'
import { Fragment, useRef } from 'react'
import { IconChevronLeft, IconChevronRight, IconStar } from '@tabler/icons-react'
import { Button } from '../ui/button'

const FavoriteStrip = ({ setSelectedAsset }: { setSelectedAsset: (asset: string) => void }) => {
  const isSpot = useIsSpot()
  const { favorites } = useFavorites(isSpot)
  const favoriteStripRef = useRef<HTMLDivElement>(null)

  const scrollRight = () => {
    if (favoriteStripRef.current) {
      favoriteStripRef.current.scrollBy({
        left: favoriteStripRef.current?.clientWidth - 96 || 0,
        behavior: 'smooth'
      })
    }
  }

  const scrollLeft = () => {
    if (favoriteStripRef.current) {
      favoriteStripRef.current.scrollBy({
        left: -(favoriteStripRef.current?.clientWidth - 96 || 0),
        behavior: 'smooth'
      })
    }
  }

  if (favorites.size === 0) {
    return (
      <div className="flex items-center gap-2 justify-center bg-secondary p-1 rounded-md w-full !h-10 overflow-hidden">
        <IconStar className="size-3 text-white/20" />
        <p className="text-white/20 text-sm">No assets added to favorites.</p>
      </div>
    )
  }

  return (
    <div className="flex bg-secondary p-1 rounded-md w-full !h-10 pr-24 relative overflow-hidden">
      <div
        ref={favoriteStripRef}
        className="flex w-fit items-center gap-4 overflow-x-auto no-scrollbar"
      >
        <ToggleGroup
          type="single"
          className="flex items-center gap-2 h-full"
          onValueChange={(asset) => {
            if (!asset.length) return
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
      <div className="flex items-center justify-center absolute right-0 top-0 !p-1 w-fit h-full gap-1">
        <Button onClick={scrollLeft} variant="outline" size="icon" className="h-full aspect-square">
          <IconChevronLeft className="size-4 text-white/50" />
        </Button>
        <Button
          onClick={scrollRight}
          variant="outline"
          size="icon"
          className="h-full aspect-square"
        >
          <IconChevronRight className="size-4 text-white/50" />
        </Button>
      </div>
    </div>
  )
}

export default FavoriteStrip
