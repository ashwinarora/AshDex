'use client'
import { useChartUIStore } from '@/store/ChartUIStore'
import type { IntervalType } from './ChartTypes'
import { cn } from '@/lib/utils'

const OPTIONS: { value: IntervalType; label: string }[] = [
  { value: '1', label: '1m' },
  { value: '5', label: '5m' },
  { value: '15', label: '15m' },
  { value: '60', label: '1h' },
  { value: '240', label: '4h' },
  { value: '1D', label: '1d' },
  { value: '1W', label: '1w' }
]

const IntervalSelector = () => {
  const selected = useChartUIStore((s) => s.selectedInterval)
  const setSelected = useChartUIStore((s) => s.setSelectedInterval)

  return (
    <div
      className="flex items-center gap-0.5 rounded-md bg-secondary p-0.5 w-fit"
      role="tablist"
      aria-label="Chart interval"
    >
      {OPTIONS.map((opt) => {
        const active = selected === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            data-testid={`interval-${opt.label}`}
            onClick={() => setSelected(opt.value)}
            className={cn(
              'px-2.5 h-7 rounded text-xs font-medium transition-colors cursor-pointer',
              active ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default IntervalSelector
