import React, { useEffect, useRef, useState } from 'react'

type ValueIndicatorProps = {
  value?: number
  className?: string
}

const ValueIndicator: React.FC<ValueIndicatorProps> = ({ value, className = '' }) => {
  const prevValueRef = useRef<number>(value || 0)
  const [colorClass, setColorClass] = useState<string>('text-white')

  useEffect(() => {
    if (value === undefined) return
    if (value > prevValueRef.current) {
      setColorClass('text-green')
    } else if (value < prevValueRef.current) {
      setColorClass('text-red')
    }
    prevValueRef.current = value
  }, [value])

  return (
    <div className={`${colorClass} ${className}   font-semibold`}>
      {value !== undefined ? (
        `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`
      ) : (
        <div className="w-16 h-6 rounded animate-pulse bg-white/10" />
      )}
    </div>
  )
}

export default ValueIndicator
