import React from 'react'
import { cn } from '@/utils/utils'

interface RadioButtonProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  value: string
  name: string
  checked?: boolean
  onChange?: (value: string) => void
  className?: string
}

const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  value,
  name,
  checked,
  onChange,
  className,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  return (
    <label className={cn('flex items-center gap-2 cursor-pointer', className)}>
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
            'h-5 w-5 rounded-full border border-[#FFFFFF0F] bg-[#0F081680]',
            'peer-checked:border-primary peer-checked:bg-primary',
            'transition-all duration-200'
          )}
        >
          {checked && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full" />
          )}
        </div>
      </div>
      {label && <span className="text-[#E8E0F1]">{label}</span>}
    </label>
  )
}

export default RadioButton
