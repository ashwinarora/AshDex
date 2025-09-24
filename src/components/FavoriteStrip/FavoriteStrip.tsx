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
import clsx from 'clsx'
import { cn } from '@/lib/utils'
import { useTranslate } from '@tolgee/react'
import { useSpotMeta } from '@/hooks/useSpotMeta'

const FavoriteStrip = ({ isRTL, width }: { isRTL: boolean; width?: number }) => {
  const isSpot = useIsSpot()
  const router = useRouter()
  const { spotKeyToName } = useSpotMeta()
  const { favorites, displayMode, setDisplayMode } = useFavorites(isSpot)
  const favoriteStripRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslate()
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
        <p className="text-white/20 text-sm">{t('No assets added to favorites.')}</p>
      </div>
    )
  }

  return (
    <div
      style={{ width: width }}
      className={cn(
        'flex bg-secondary p-1 rounded-md !h-10 relative overflow-hidden',
        isRTL ? 'flex-row-reverse pl-32' : 'pr-32',
        width ? 'w-fit' : 'w-full'
      )}
    >
      <div
        ref={favoriteStripRef}
        className="flex w-fit items-center gap-4 overflow-x-auto no-scrollbar"
      >
        <ToggleGroup
          type="single"
          className={clsx('flex items-center gap-2 h-full', isRTL ? 'flex-row-reverse' : '')}
          onValueChange={(asset) => {
            if (!asset.length) return
            router.push(`${isSpot ? '/spot/' : '/'}${isSpot ? spotKeyToName.get(asset) : asset}`)
          }}
        >
          {(isRTL ? Array.from(favorites).reverse() : Array.from(favorites)).map(
            (favorite, index) => (
              <Fragment key={favorite}>
                <FavoriteItem assetKey={favorite} />
                {index !==
                  (isRTL ? Array.from(favorites).reverse() : Array.from(favorites)).length - 1 && (
                  <Separator orientation="vertical" className="!h-full last:hidden" />
                )}
              </Fragment>
            )
          )}
        </ToggleGroup>
      </div>
      <div
        className={clsx(
          'flex items-center justify-center absolute right-0 top-0 !p-1 w-fit h-full gap-1',
          isRTL ? 'left-0' : 'right-0'
        )}
      >
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
