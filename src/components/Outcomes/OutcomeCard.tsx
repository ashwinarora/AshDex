'use client'
import Link from 'next/link'
import { IconStar, IconStarFilled } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import type { OutcomeCard as OutcomeCardModel } from '@/utils/outcomes/cards'
import CoinIcon from './CoinIcon'
import { formatChance, formatMultiple, formatUsdCompact, outcomeTradeHref } from './outcomeFormat'

const DOT_COLORS = ['bg-sky-400', 'bg-orange-400', 'bg-pink-400', 'bg-emerald-400', 'bg-violet-400']

type Props = {
  card: OutcomeCardModel
  isFavorite: boolean
  onToggleFavorite: (key: string) => void
}

const OutcomeCard = ({ card, isFavorite, onToggleFavorite }: Props) => {
  const isQuestion = card.kind === 'question'
  return (
    <div
      data-testid={`outcome-card-${card.key}`}
      className="flex flex-col gap-3 rounded-md bg-surface-1 border border-surface-3 p-4 min-h-[200px]"
    >
      <div className="flex items-start gap-2">
        <CoinIcon symbol={card.underlying} className="size-6 mt-0.5" />
        <Link
          href={outcomeTradeHref(card.rows[0].outcomeId, card.rows[0].side)}
          className="flex-1 text-sm font-medium text-text-1 leading-snug hover:text-primary"
        >
          {card.title}
        </Link>
        <div className="flex items-center gap-1 shrink-0">
          {card.venue && (
            <span
              data-testid="outcome-venue-badge"
              className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-medium"
            >
              {card.venue}
            </span>
          )}
          <button
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={() => onToggleFavorite(card.key)}
            className="text-primary hover:scale-105 cursor-pointer"
          >
            {isFavorite ? (
              <IconStarFilled size={14} />
            ) : (
              <IconStar size={14} className="opacity-50 text-white" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {card.rows.map((row, i) => {
          const isNo = !isQuestion && row.side === 1
          return (
            <div key={row.coin} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    'size-1.5 rounded-full shrink-0',
                    DOT_COLORS[i % DOT_COLORS.length]
                  )}
                />
                <span className="text-xs text-text-1 truncate">{row.label}</span>
                <span className="text-xs text-text-3 shrink-0">{formatMultiple(row.multiple)}</span>
                {row.settled && <span className="text-[10px] text-text-3">settled</span>}
              </div>
              <Link
                href={outcomeTradeHref(row.outcomeId, row.side)}
                data-testid={`outcome-side-${row.encoding}`}
                className={cn(
                  'shrink-0 min-w-14 text-center text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors',
                  isNo
                    ? 'border-red/60 text-red hover:bg-red/15'
                    : 'border-green/60 text-green hover:bg-green/15'
                )}
              >
                {formatChance(row.chance)}
              </Link>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between border-t border-surface-3 pt-2 text-[11px] text-text-3">
        <span>{formatUsdCompact(card.dayNtlVlm)} 24h Volume</span>
        {isQuestion && <span>Outcomes ({card.outcomeCount})</span>}
      </div>
    </div>
  )
}

export default OutcomeCard
