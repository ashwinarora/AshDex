'use client'
import { useMemo, useState } from 'react'
import { IconChevronDown, IconSearch, IconStarFilled } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import FooterCompact from '@/components/FooterCompact'
import { useOutcomeCards } from '@/hooks/useOutcomeMarket'
import { useOutcomeMeta } from '@/hooks/useOutcomeMeta'
import { useOutcomesUIStore } from '@/store/OutcomesUIStore'
import { filterOutcomeCards, groupCardsByCategory, sortOutcomeCards } from '@/utils/outcomes/cards'
import { OUTCOME_CATEGORY_ORDER } from '@/utils/outcomes/template'
import type { OutcomeCategory } from '@/utils/outcomes/types'
import OutcomeCard from './OutcomeCard'
import { venueLabel } from './outcomeFormat'

const OutcomesLanding = () => {
  const { cards, isReady } = useOutcomeCards()
  const { resolved, error } = useOutcomeMeta()
  const { favorites, toggleFavorite, category, setCategory, venue, setVenue } = useOutcomesUIStore()
  const [search, setSearch] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const categoryTabs: (OutcomeCategory | 'All')[] = useMemo(
    () => ['All', ...resolved.categories],
    [resolved.categories]
  )

  const visible = useMemo(() => {
    const filtered = filterOutcomeCards(cards, {
      search,
      category,
      venue,
      favoriteKeys: favorites,
      favoritesOnly
    })
    return sortOutcomeCards(filtered, favorites)
  }, [cards, search, category, venue, favorites, favoritesOnly])

  const groups = useMemo(() => groupCardsByCategory(visible, OUTCOME_CATEGORY_ORDER), [visible])

  return (
    <div className="w-full min-h-dvh flex flex-col items-center text-text-1">
      <div className="w-11/12 md:w-5/6 2xl:w-3/4 flex flex-col gap-4 py-6 flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Outcomes</h1>
          <div className="relative w-full md:w-72">
            <IconSearch className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-text-3" />
            <Input
              data-testid="outcomes-search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-surface-1 border-surface-3 h-9 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-b border-surface-3">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {categoryTabs.map((tab) => (
              <button
                key={tab}
                data-testid={`outcomes-category-${tab}`}
                onClick={() => setCategory(tab)}
                className={cn(
                  'px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer',
                  category === tab
                    ? 'border-primary text-text-1'
                    : 'border-transparent text-text-3 hover:text-text-1'
                )}
              >
                {tab}
              </button>
            ))}
            <button
              onClick={() => setFavoritesOnly((v) => !v)}
              className={cn(
                'px-3 py-2 text-sm flex items-center gap-1 border-b-2 -mb-px cursor-pointer',
                favoritesOnly
                  ? 'border-primary text-text-1'
                  : 'border-transparent text-text-3 hover:text-text-1'
              )}
              aria-pressed={favoritesOnly}
            >
              <IconStarFilled className="size-3" /> Favorites
            </button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                data-testid="outcomes-venue-trigger"
                className="text-sm text-text-2 gap-1"
              >
                {venue === 'All' ? 'Deployer' : venue === 'hl' ? 'Hyperliquid' : venue}
                <IconChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
              <DropdownMenuItem onClick={() => setVenue('All')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setVenue('hl')}>{venueLabel(null)}</DropdownMenuItem>
              {resolved.venues.map((v) => (
                <DropdownMenuItem
                  key={v}
                  onClick={() => setVenue(v)}
                  data-testid={`outcomes-venue-${v}`}
                >
                  {v}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {error && (
          <p className="text-sm text-red" data-testid="outcomes-error">
            Could not load outcome markets. {String((error as Error).message ?? '')}
          </p>
        )}

        {!isReady && !error && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
            data-testid="outcomes-loading"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 bg-surface-1" />
            ))}
          </div>
        )}

        {isReady && groups.length === 0 && (
          <div
            data-testid="outcomes-empty-state"
            className="w-full py-16 flex flex-col items-center text-text-3 text-sm"
          >
            No outcome markets match your filters.
          </div>
        )}

        {isReady &&
          groups.map((group) => (
            <section
              key={group.category}
              className="flex flex-col gap-3"
              data-testid="outcomes-grid"
            >
              <h2 className="text-sm font-medium text-text-2">{group.category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {group.cards.map((card) => (
                  <OutcomeCard
                    key={card.key}
                    card={card}
                    isFavorite={favorites.has(card.key)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </section>
          ))}
      </div>
      <FooterCompact />
    </div>
  )
}

export default OutcomesLanding
