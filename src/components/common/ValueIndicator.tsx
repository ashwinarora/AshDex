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
      setColorClass('text-[#2FA766]')
    } else if (value < prevValueRef.current) {
      setColorClass('text-[#E2464A]')
    }
    prevValueRef.current = value
  }, [value])

  return (
    <div className={`${colorClass} ${className}`}>
      {value !== undefined ? (
        `$${value}`
      ) : (
        <div className="animate-pulse h-6 w-16 bg-white/10 rounded" />
      )}
    </div>
  )
}

export default ValueIndicator
