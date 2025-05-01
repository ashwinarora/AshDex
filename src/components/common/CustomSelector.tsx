import { useState } from 'react'
import DropDown from '@/assets/images/tabler_chevron-down.svg'
import Image from 'next/image'

interface CustomSelectorProps {
  options: { value: string; label: string; flag?: string }[]
  selectedValue: string
  onChange: (value: string) => void
  className?: string
  isPadding?: boolean
}

const CustomSelector: React.FC<CustomSelectorProps> = ({
  options,
  selectedValue,
  onChange,
  className = '',
  isPadding
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative z-50">
      <div
        className={`w-full text-white px-4 ${isPadding ? 'py-1.5' : 'py-0'}  text-sm flex justify-between z-40 items-center ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {options?.find((opt) => opt?.value === selectedValue)?.flag && (
          <Image
            className="w-4 h-4"
            width={16}
            height={16}
            alt={options?.find((opt) => opt?.value === selectedValue)?.label || 'Select'}
            src={options?.find((opt) => opt?.value === selectedValue)?.flag || ''}
          />
        )}
        {options?.find((opt) => opt?.value === selectedValue)?.label || 'Select'}
        <Image src={DropDown} style={{ width: 20, height: 'auto' }} className="pl-1" alt="" />
      </div>

      {isOpen && (
        <div className="absolute z-50 border-2 border-white/10 bg-secondary min-w-24 mt-2  rounded-lg shadow-lg p-2">
          {options.map((option) => (
            <div
              key={option.value}
              className=" px-2 py-2 cursor-pointer hover:bg-[#322944] hover:rounded text-gray-300 flex items-center gap-2 "
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
            >
              {option.flag && (
                <Image
                  className="w-4 h-4"
                  width={16}
                  height={16}
                  alt={option.label}
                  src={option.flag}
                />
              )}{' '}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomSelector
