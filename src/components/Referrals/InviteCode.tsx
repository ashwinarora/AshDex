'use client'
import { Input } from '../ui/input'

interface InviteCodeProps {
  value?: string
  onChange?: (value: string) => void
  maxLength?: number
  className?: string
  placeholder?: string
}

export function InviteCode({ value = '', onChange, className = '' }: InviteCodeProps) {
  const inputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue.length > 8) {
      return
    }
    const upperCaseValue = newValue.toUpperCase()
    onChange?.(upperCaseValue)
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <Input value={value} onChange={inputHandler} className="tracking-[0.5em] text-center" />
    </div>
  )
}
