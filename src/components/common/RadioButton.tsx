import React from 'react'
import { cn } from '@/lib/utils'

interface RadioButtonProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  value: string
  name: string
  checked?: boolean
  onChange?: (value: string) => void
  className?: string
  isBackground?: boolean
}

const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  value,
  name,
  checked,
  onChange,
  className,
  isBackground,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }
  return (
    <label
      className={cn(
        'flex items-center gap-2 cursor-pointer hover:bg-primary/20 rounded-md p-1 px-2',
        className,
        isBackground && 'max-sm:bg-white/10 max-sm:rounded-lg max-sm:p-3'
      )}
    >
      <div className="relative">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={handleChange}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            'h-4 w-4 rounded-full bg-[rgba(15,8,22,0.5)] border-2 border-[rgba(255,255,255,0.16)]',
            'peer-checked:border-primary border-2',
            'transition-all duration-200'
          )}
        >
          {checked && (
            <div className="absolute w-2 h-2 transform -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 bg-primary" />
          )}
        </div>
      </div>
      {label && <span className="text-white/50text-xs font-medium tracking-tight">{label}</span>}
    </label>
  )
}

export default RadioButton
