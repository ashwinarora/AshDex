import { useState } from 'react'
import DropDown from '../../../assets/images/tabler_chevron-down.svg'
import Image from 'next/image'

interface CustomSelectorProps {
  options: { value: string; label: string }[]
  selectedValue: string
  onChange: (value: string) => void
  className?: string
}

const CustomSelector: React.FC<CustomSelectorProps> = ({
  options,
  selectedValue,
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        className={`w-full text-white max-px-4 max-py-2 text-sm rounded-md flex justify-between items-center ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {options?.find((opt) => opt?.value === selectedValue)?.label || 'Select'}
        <Image src={DropDown} width={20} height={20} className="pl-1" alt="" />
      </button>

      {isOpen && (
        <div className="absolute z-50 border-2 border-white/10 bg-[#0F0816] min-w-24 rounded-2xl shadow-lg p-2">
          {options.map((option) => (
            <div
              key={option.value}
              className="px-4 py-2 cursor-pointer hover:bg-[#322944] hover:rounded text-gray-300"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomSelector
