'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface DropdownProps {
  options: string[]
  selected: string
  onSelect: (option: string) => void
  className?: string
}

const Dropdown: React.FC<DropdownProps> = ({ options, selected, onSelect, className }) => {
  console.log('🚀 ~ options:', options)

  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {/* Dropdown Trigger Button */}
      <button
        className={`px-4 py-2 rounded-lg flex items-center justify-between w-20 cursor-pointer`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected} <ChevronDown size={18} className="ml-2" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute mt-1 w-20 border border-gray-600 rounded-lg shadow-lg z-10 ${className}`}
        >
          {options.map((option) => (
            <button
              key={option}
              className={`block w-full text-left px-4 py-1 ${className}`}
              onClick={() => {
                onSelect(option)
                setIsOpen(false)
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dropdown
