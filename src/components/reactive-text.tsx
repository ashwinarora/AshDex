import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

function ReactiveText({
  value,
  precision = 0,
  type = 'currency',
  currency = '$',
  pulse = false,
  isStatic = false,
  suffix = '',
  className = '',
  'data-testid': dataTestId
}: {
  value: number | string
  precision?: number
  type?: 'currency' | 'number' | 'percentage' | 'leverage'
  currency?: string
  pulse?: boolean
  isStatic?: boolean
  suffix?: string
  className?: string
  'data-testid'?: string
}) {
  const [color, setColor] = useState<'text-buy' | 'text-sell' | 'text-text-1'>('text-text-1')
  const [prevValue, setPrevValue] = useState<number>(Number(value))

  const getSafeNumber = (val: number | string): number => {
    const num = Number(val)
    return isNaN(num) ? 0 : num
  }

  useEffect(() => {
    const currentValue = getSafeNumber(value)

    if (!pulse) {
      if (isStatic) {
        if (currentValue > 0) {
          setColor('text-buy')
        } else if (currentValue < 0) {
          setColor('text-sell')
        } else {
          setColor('text-text-1')
        }
      } else {
        setColor('text-text-1')
      }
      return
    }

    if (currentValue > prevValue) {
      setColor('text-buy')
    } else if (currentValue < prevValue) {
      setColor('text-sell')
    }

    setPrevValue(currentValue)

    if (!isStatic) {
      const colorTimer = setTimeout(() => {
        setColor('text-text-1')
      }, 400)
      return () => clearTimeout(colorTimer)
    }
  }, [value, pulse, prevValue, isStatic])

  return (
    <p
      className={cn('text-xs font-tabular transition-all duration-300', color, className)}
      data-testid={dataTestId}
    >
      {type === 'currency' ? currency : ''}
      {new Intl.NumberFormat('en-US', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
      }).format(getSafeNumber(value))}
      {type === 'percentage' ? '%' : ''}
      {type === 'leverage' ? 'x' : ''}
      {suffix && <>&nbsp;{suffix}</>}
    </p>
  )
}

export default ReactiveText
