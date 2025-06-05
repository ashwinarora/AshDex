import React, { useEffect, useRef, useState } from 'react'

type ValueIndicatorProps = {
  value?: number
  className?: string
}

const ValueIndicator: React.FC<ValueIndicatorProps> = ({ value, className = '' }) => {
  const prevValueRef = useRef<number>(value || 0)
  const [colorClass, setColorClass] = useState<string>('text-white')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (value === undefined) return
    if (value > prevValueRef.current) {
      setColorClass('text-green')
    } else if (value < prevValueRef.current) {
      setColorClass('text-red')
    }
    prevValueRef.current = value

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout to revert color
    timeoutRef.current = setTimeout(() => {
      setColorClass('text-white')
    }, 1000) // Revert after 1 second

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value])

  return (
    <div className={`${colorClass} ${className}  transition-all duration-100`}>
      {value !== undefined ? (
        `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(value)}`
      ) : (
        <div className="bg-white/10 rounded w-16 h-6 animate-pulse" />
      )}
    </div>
  )
}

export default ValueIndicator
