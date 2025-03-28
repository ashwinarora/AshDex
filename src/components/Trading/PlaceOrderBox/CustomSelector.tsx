import { useState } from 'react'
import DropDown from '../../../assets/images/tabler_chevron-down.svg'
import Image from 'next/image'

interface CustomSelectorProps {
  options: { value: string; label: string }[]
  selectedValue: string
  onChange: (value: string) => void
}

const CustomSelector: React.FC<CustomSelectorProps> = ({ options, selectedValue, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative w-20">
      <button
        className="w-full py-0.5 text-white px-4 text-sm rounded-md flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {options.find((opt) => opt.value === selectedValue)?.label || 'Select'}
        <Image src={DropDown} width={20} height={20} className="pl-1" alt="" />
      </button>

      {isOpen && (
        <div className="absolute border-2 border-white/10 bg-[#0F0816] rounded-2xl shadow-lg p-2">
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
