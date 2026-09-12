'use client'
import { useChartHoverStore } from '@/store/ChartHoverStore'
import { cn } from '@/lib/utils'

const decimalsFor = (n: number): number => {
  const abs = Math.abs(n)
  if (abs >= 100) return 2
  if (abs >= 1) return 3
  if (abs >= 0.01) return 5
  return 6
}

const formatPrice = (n: number, decimals: number): string =>
  n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })

const OhlcReadout = () => {
  const bar = useChartHoverStore((s) => s.focusedBar)

  // Reserve height while loading so the row doesn't collapse and jump.
  if (!bar) return <div className="h-6" aria-hidden />

  const change = bar.close - bar.open
  const pct = bar.open !== 0 ? (change / bar.open) * 100 : 0
  const isUp = change >= 0
  const sign = isUp ? '+' : ''
  // Anchor decimals to the open price so the change lines up visually with OHLC.
  const decimals = decimalsFor(bar.open)

  return (
    <div
      className="flex items-center gap-3 text-xs font-mono text-white/80 whitespace-nowrap"
      data-testid="ohlc-readout"
    >
      <span>
        <span className="text-white/50 mr-1">O</span>
        {formatPrice(bar.open, decimals)}
      </span>
      <span>
        <span className="text-white/50 mr-1">H</span>
        {formatPrice(bar.high, decimals)}
      </span>
      <span>
        <span className="text-white/50 mr-1">L</span>
        {formatPrice(bar.low, decimals)}
      </span>
      <span>
        <span className="text-white/50 mr-1">C</span>
        {formatPrice(bar.close, decimals)}
      </span>
      <span className={cn('font-medium', isUp ? 'text-buy' : 'text-sell')}>
        {sign}
        {formatPrice(change, decimals)} ({sign}
        {pct.toFixed(2)}%)
      </span>
    </div>
  )
}

export default OhlcReadout
