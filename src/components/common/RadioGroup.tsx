import React, { createContext, useContext, useState } from 'react'
import { cn } from '@/utils/utils'
import RadioButton from './RadioButton'

interface RadioGroupContextType {
  value: string
  onChange: (value: string) => void
  name: string
}

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(undefined)

interface RadioGroupProps {
  children: React.ReactNode
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  name: string
  label?: string
  className?: string
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  value: controlledValue,
  defaultValue,
  onChange,
  name,
  label,
  className
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '')

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue
  const handleChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue)
    }
    if (onChange) {
      onChange(newValue)
    }
  }

  return (
    <RadioGroupContext.Provider value={{ value, onChange: handleChange, name }}>
      {label && <p className="text-md text-gray-400">{label}</p>}

      <div className={cn('flex flex-col gap-4', className)} role="radiogroup">
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

interface RadioGroupItemProps {
  value: string
  label?: string
  className?: string
}

export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({ value, label, className }) => {
  const context = useContext(RadioGroupContext)

  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup')
  }

  const { value: selectedValue, onChange, name } = context

  return (
    <RadioButton
      value={value}
      name={name}
      checked={value === selectedValue}
      onChange={onChange}
      label={label}
      className={className}
    />
  )
}

export default RadioGroup
