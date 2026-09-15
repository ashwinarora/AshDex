'use client'

import { useFavorites } from '@/store/FavoritesStore'
import FavoriteItem from './FavoriteItem'
import useIsSpot from '@/hooks/useIsSpot'
import { ToggleGroup } from '../ui/toggle-group'
import { Separator } from '../ui/separator'
import { Fragment, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconChevronLeft,
  IconChevronRight,
  IconCurrencyDollar,
  IconPercentage,
  IconStar
} from '@tabler/icons-react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { useSpotMeta } from '@/hooks/useSpotMeta'

const FavoriteStrip = ({ width }: { width?: number }) => {
  const isSpot = useIsSpot()
  const router = useRouter()
  const { spotKeyToName, spotKeyToBaseName } = useSpotMeta()
  const { favorites, displayMode, setDisplayMode } = useFavorites(isSpot)
  const favoriteStripRef = useRef<HTMLDivElement>(null)
  const scrollRight = () => {
    if (favoriteStripRef.current) {
      favoriteStripRef.current.scrollBy({
        left: favoriteStripRef.current?.clientWidth - 128 || 0,
        behavior: 'smooth'
      })
    }
  }

  const scrollLeft = () => {
    if (favoriteStripRef.current) {
      favoriteStripRef.current.scrollBy({
        left: -(favoriteStripRef.current?.clientWidth - 128 || 0),
        behavior: 'smooth'
      })
    }
  }

  if (favorites.size === 0) {
    return (
      <div
        style={{ width: width }}
        className="flex items-center gap-2 justify-center bg-secondary p-1 rounded-md !h-10 overflow-hidden"
      >
        <IconStar className="size-3 text-white/20" />
        <p className="text-white/20 text-sm">No assets added to favorites.</p>
      </div>
    )
  }

  return (
    <div
      style={{ width: width }}
      className={cn(
        'flex bg-secondary p-1 rounded-md !h-10 relative overflow-hidden pr-32',
        width ? 'w-fit' : 'w-full'
      )}
    >
      <div
        ref={favoriteStripRef}
        className="flex w-fit items-center gap-4 overflow-x-auto no-scrollbar"
      >
        <ToggleGroup
          type="single"
          className="flex items-center gap-2 h-full"
          onValueChange={(asset) => {
            if (!asset.length) return
            router.push(`${isSpot ? '/spot/' : '/'}${isSpot ? spotKeyToName.get(asset) : asset}`)
          }}
        >
          {Array.from(favorites)
            .filter((favorite) => {
              // Spot favorites need resolvable base+name from spotMeta.
              // Perp favorites need no gating: whatever the user has
              // starred is fair game (Hyperliquid decides delisting).
              if (!isSpot) return true
              const base = spotKeyToBaseName.get(favorite)
              const name = spotKeyToName.get(favorite)
              return Boolean(base && name)
            })
            .map((favorite, index) => (
              <Fragment key={favorite}>
                <FavoriteItem assetKey={favorite} />
                {index !== Array.from(favorites).length - 1 && (
                  <Separator orientation="vertical" className="!h-full last:hidden" />
                )}
              </Fragment>
            ))}
        </ToggleGroup>
      </div>
      <div className="flex items-center justify-center absolute right-0 top-0 !p-1 w-fit h-full gap-1">
        <Button onClick={scrollLeft} variant="outline" size="icon" className="h-full aspect-square">
          <IconChevronLeft className="size-4 text-white" />
        </Button>
        <Button
          onClick={() => setDisplayMode(displayMode === 'usd' ? 'percent' : 'usd')}
          variant="outline"
          size="icon"
          className="h-full text-white aspect-square"
        >
          {displayMode === 'usd' ? (
            <IconCurrencyDollar className="size-4" />
          ) : (
            <IconPercentage className="size-4" />
          )}
        </Button>
        <Button
          onClick={scrollRight}
          variant="outline"
          size="icon"
          className="h-full aspect-square"
        >
          <IconChevronRight className="size-4 text-white" />
        </Button>
      </div>
    </div>
  )
}

export default FavoriteStrip
