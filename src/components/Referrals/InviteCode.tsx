'use client'
import { useState } from 'react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

interface InviteCodeProps {
  value?: string
  onChange?: (value: string) => void
  maxLength?: number
  className?: string
  placeholder?: string
}

export function InviteCode({
  value = '',
  onChange,
  maxLength = 6,
  className = '',
  placeholder = 'Enter code'
}: InviteCodeProps) {
  const [code, setCode] = useState(value)

  const handleCodeChange = (newValue: string) => {
    const upperCaseValue = newValue.toUpperCase()
    setCode(upperCaseValue)
    onChange?.(upperCaseValue)
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <InputOTP maxLength={maxLength} value={code} onChange={handleCodeChange}>
        <InputOTPGroup className="gap-2">
          {Array.from({ length: maxLength }, (_, index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className="h-12 w-12 rounded-md border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.06)] text-white"
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  )
}
