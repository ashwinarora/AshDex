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
      setColorClass('text-green-500')
    } else if (value < prevValueRef.current) {
      setColorClass('text-red-500')
    }
    prevValueRef.current = value
  }, [value])

  return <div className={`${colorClass} ${className}`}>{value || ''}</div>
}

export default ValueIndicator
