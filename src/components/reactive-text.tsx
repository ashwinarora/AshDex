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
  className = ''
}: {
  value: number | string
  precision?: number
  type?: 'currency' | 'number' | 'percentage' | 'leverage'
  currency?: string
  pulse?: boolean
  isStatic?: boolean
  suffix?: string
  className?: string
}) {
  const [color, setColor] = useState<'text-green' | 'text-red' | 'text-white'>('text-white')
  const [prevValue, setPrevValue] = useState<number>(Number(value))

  const getSafeNumber = (val: number | string): number => {
    const num = Number(val)
    return isNaN(num) ? 0 : num
  }

  useEffect(() => {
    const currentValue = getSafeNumber(value)

    if (!pulse) {
      if (isStatic) {
        // When pulse is false and isStatic is true, color based on value sign
        if (currentValue > 0) {
          setColor('text-green')
        } else if (currentValue < 0) {
          setColor('text-red')
        } else {
          setColor('text-white')
        }
      } else {
        setColor('text-white')
      }
      return
    }

    if (currentValue > prevValue) {
      setColor('text-green')
    } else if (currentValue < prevValue) {
      setColor('text-red')
    }

    setPrevValue(currentValue)

    // Only reset color to white if not static
    if (!isStatic) {
      const colorTimer = setTimeout(() => {
        setColor('text-white')
      }, 400)
      return () => clearTimeout(colorTimer)
    }
  }, [value, pulse, prevValue, isStatic])

  return (
    <p className={cn('text-xs transition-all duration-300', color, className)}>
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
