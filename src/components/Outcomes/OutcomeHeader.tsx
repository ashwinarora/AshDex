'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconChevronDown, IconSearch, IconStar, IconStarFilled } from '@tabler/icons-react'
import { useShallow } from 'zustand/react/shallow'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useOutcomesUIStore } from '@/store/OutcomesUIStore'
import { useOutcomeCards, useOutcomeSideStats } from '@/hooks/useOutcomeMarket'
import type { ResolvedOutcomeMeta } from '@/utils/outcomes/template'
import type { ResolvedOutcome } from '@/utils/outcomes/types'
import CoinIcon from './CoinIcon'
import OutcomeDetailsModal from './OutcomeDetailsModal'
import {
  formatChance,
  formatCountdown,
  formatOutcomePx,
  formatUsd,
  formatUsdCompact,
  outcomeTradeHref
} from './outcomeFormat'

type Props = {
  outcome: ResolvedOutcome
  side: 0 | 1
  resolved: ResolvedOutcomeMeta
}

const Stat = ({
  label,
  value,
  className
}: {
  label: string
  value: string
  className?: string
}) => (
  <div className="flex flex-col gap-0.5 min-w-fit">
    <span className="text-[11px] text-text-3 whitespace-nowrap">{label}</span>
    <span className={cn('text-xs font-medium text-text-1 whitespace-nowrap', className)}>
      {value}
    </span>
  </div>
)

const OutcomeHeader = ({ outcome, side, resolved }: Props) => {
  const router = useRouter()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const { cards } = useOutcomeCards()
  const { favorites, toggleFavorite } = useOutcomesUIStore(
    useShallow((s) => ({ favorites: s.favorites, toggleFavorite: s.toggleFavorite }))
  )
  const allMids = useHyperliquidStore((s) => s.allMids)
  const sideSpec = outcome.sides[side]
  const stats = useOutcomeSideStats(sideSpec.coin)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const cardKey =
    outcome.questionId !== undefined ? `q:${outcome.questionId}` : `o:${outcome.outcomeId}`
  const isFavorite = favorites.has(cardKey)

  const question =
    outcome.questionId !== undefined ? resolved.questions.get(outcome.questionId) : undefined
  const siblings = useMemo(
    () =>
      question
        ? question.outcomeIds
            .map((id) => resolved.outcomes.get(id))
            .filter((o): o is ResolvedOutcome => !!o)
        : [],
    [question, resolved]
  )

  const pickerRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return cards
      .flatMap((c) =>
        c.rows.map((r) => ({
          key: `${c.key}:${r.coin}`,
          title: c.kind === 'question' ? `${c.title} — ${r.label}` : c.title,
          venue: c.venue,
          underlying: c.underlying,
          outcomeId: r.outcomeId,
          side: r.side,
          chance: r.chance,
          price: r.price,
          vol: r.dayNtlVlm
        }))
      )
      .filter((r) => !q || r.title.toLowerCase().includes(q) || (r.venue ?? '').includes(q))
      .slice(0, 200)
  }, [cards, search])

  const underlyingPx = outcome.underlyingCoin ? Number(allMids[outcome.underlyingCoin]) : NaN
  const change = stats.change24hPct

  return (
    <div
      className="w-full flex flex-col gap-2 bg-surface-1 rounded-md p-2"
      data-testid="outcome-header"
    >
      {outcome.venue && (
        <div
          className="text-[11px] text-primary bg-primary/10 rounded px-2 py-1"
          data-testid="outcome-venue-banner"
        >
          This is an outcome market deployed independently by <b>{outcome.venue}</b>. Beware of low
          liquidity, high volatility, unclear settlement criteria, and disputable settlement
          sources.
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={() => toggleFavorite(cardKey)}
          className="text-primary cursor-pointer"
        >
          {isFavorite ? (
            <IconStarFilled size={16} />
          ) : (
            <IconStar size={16} className="opacity-50 text-white" />
          )}
        </button>

        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <button
              data-testid="outcome-market-trigger"
              className="flex items-center gap-2 text-sm font-semibold text-text-1 cursor-pointer max-w-xl text-left"
            >
              <CoinIcon symbol={outcome.underlying} className="size-5" />
              <span className="truncate">{outcome.title}</span>
              <IconChevronDown className="size-4 text-text-3 shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[640px] max-w-[95vw] p-2 bg-surface-2 border-surface-3"
          >
            <div className="relative mb-2">
              <IconSearch className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-text-3" />
              <Input
                autoFocus
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-surface-1 border-surface-3"
              />
            </div>
            <div className="grid grid-cols-[1fr_60px_70px_70px] gap-2 px-2 text-[11px] text-text-3">
              <span>Live Outcomes</span>
              <span className="text-right">% Chance</span>
              <span className="text-right">Price</span>
              <span className="text-right">Volume</span>
            </div>
            <Separator className="my-1" />
            <div className="max-h-80 overflow-y-auto no-scrollbar">
              {pickerRows.map((r) => (
                <button
                  key={r.key}
                  onClick={() => {
                    setPickerOpen(false)
                    router.push(outcomeTradeHref(r.outcomeId, r.side))
                  }}
                  className="w-full grid grid-cols-[1fr_60px_70px_70px] gap-2 px-2 py-1.5 text-xs text-left hover:bg-surface-3 rounded cursor-pointer items-center"
                >
                  <span className="truncate text-text-1 flex items-center gap-2">
                    <CoinIcon symbol={r.underlying} className="size-4" />
                    <span className="truncate">{r.title}</span>
                    {r.venue && <span className="text-[10px] text-primary">{r.venue}</span>}
                  </span>
                  <span className="text-right">{formatChance(r.chance)}</span>
                  <span className="text-right">{formatOutcomePx(r.price)}</span>
                  <span className="text-right text-text-3">{formatUsdCompact(r.vol)}</span>
                </button>
              ))}
              {pickerRows.length === 0 && (
                <p className="text-xs text-text-3 px-2 py-4 text-center">No markets found</p>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {siblings.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-primary font-semibold gap-1"
                data-testid="outcome-sibling-trigger"
              >
                {outcome.outcomeLabel}
                <IconChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {siblings.map((s) => (
                <DropdownMenuItem
                  key={s.outcomeId}
                  onClick={() => router.push(outcomeTradeHref(s.outcomeId, side))}
                  className={cn(s.outcomeId === outcome.outcomeId && 'text-primary')}
                >
                  {s.outcomeLabel}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7"
          onClick={() => setDetailsOpen(true)}
          data-testid="outcome-details-trigger"
        >
          Details
        </Button>

        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar ml-auto">
          {outcome.underlying && (
            <Stat
              label={`${outcome.underlying} Price / Countdown`}
              value={`${Number.isFinite(underlyingPx) ? underlyingPx.toLocaleString('en-US', { maximumFractionDigits: 6 }) : '--'} / ${formatCountdown(outcome.expiresAt, now)}`}
            />
          )}
          {!outcome.underlying && (
            <Stat label="Countdown" value={formatCountdown(outcome.expiresAt, now)} />
          )}
          <Stat
            label="% Chance"
            value={formatChance(stats.mid === null ? null : stats.mid * 100)}
          />
          <Stat label={`Price (${sideSpec.name})`} value={formatOutcomePx(stats.mid)} />
          <Stat
            label="24h Change"
            value={change === null ? '--' : `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`}
            className={change === null ? '' : change >= 0 ? 'text-green' : 'text-red'}
          />
          <Stat label="24h Volume" value={formatUsd(stats.dayNtlVlm)} />
        </div>
      </div>
      <OutcomeDetailsModal outcome={outcome} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </div>
  )
}

export default OutcomeHeader
