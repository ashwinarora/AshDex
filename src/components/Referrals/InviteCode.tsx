'use client'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp'

interface InviteCodeProps {
  value?: string
  onChange?: (value: string) => void
  maxLength?: number
  className?: string
  placeholder?: string
}

export function InviteCode({ value = '', onChange, className = '' }: InviteCodeProps) {
  const inputHandler = (newValue: string) => {
    onChange?.(newValue.toUpperCase())
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <InputOTP maxLength={6} value={value} onChange={inputHandler}>
        <InputOTPGroup>
          <InputOTPSlot className="size-12 text-xl font-bold" index={0} />
          <InputOTPSlot className="size-12 text-xl font-bold" index={1} />
          <InputOTPSlot className="size-12 text-xl font-bold" index={2} />
          <InputOTPSlot className="size-12 text-xl font-bold" index={3} />
          <InputOTPSlot className="size-12 text-xl font-bold" index={4} />
          <InputOTPSlot className="size-12 text-xl font-bold" index={5} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  )
}
