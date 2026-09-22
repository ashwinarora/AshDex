'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Small round icon for the perp an outcome references. Hyperliquid serves SVGs
 * for its coins; anything missing falls back to the first letters of the symbol.
 */
const CoinIcon = ({ symbol, className }: { symbol?: string; className?: string }) => {
  const [failed, setFailed] = useState(false)
  const label = (symbol ?? '?').slice(0, 3).toUpperCase()
  if (!symbol || failed) {
    return (
      <div
        className={cn(
          'shrink-0 rounded-full bg-surface-3 text-[10px] font-semibold text-text-2 flex items-center justify-center',
          className ?? 'size-6'
        )}
        aria-hidden
      >
        {label}
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://app.hyperliquid.xyz/coins/${symbol.toUpperCase()}.svg`}
      alt={symbol}
      className={cn('shrink-0 rounded-full', className ?? 'size-6')}
      onError={() => setFailed(true)}
    />
  )
}

export default CoinIcon
