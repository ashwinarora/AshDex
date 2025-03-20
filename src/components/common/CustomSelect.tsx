import Image from 'next/image'
import { useState } from 'react'

const currencyOptions = [
  {
    value: 'BTC',
    label: 'Bitcoin',
    img: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=024'
  },
  {
    value: 'USDT',
    label: 'Tether',
    img: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=024'
  }
]

interface CustomSelectProps {
  onSelect?: (value: string) => void
}

const CustomSelect = ({ onSelect }: CustomSelectProps) => {
  const [selected, setSelected] = useState(currencyOptions[0])

  interface CurrencyOption {
    value: string
    label: string
    img: string
  }

  const handleSelect = (option: CurrencyOption) => {
    setSelected(option)
    if (onSelect) onSelect(option.value) // Pass selected value to parent
  }

  return (
    <div className="relative w-full">
      <button className="w-full flex items-center justify-between py-2 px-3 bg-[#1E1E2E] text-white rounded border-2 border-[#FFFFFF0F] focus:outline-none">
        <Image
          src={selected.img}
          alt={selected.label}
          width={20}
          height={20}
          className="w-5 h-5 mr-2"
        />
        {selected.label}
        <span className="ml-auto">▼</span>
      </button>

      <div className="absolute w-full bg-[#1E1E2E] border border-[#FFFFFF0F] rounded mt-2">
        {currencyOptions.map((option) => (
          <button
            key={option.value}
            className="flex items-center w-full py-2 px-3 hover:bg-[#2E2E3E] text-white"
            onClick={() => handleSelect(option)}
          >
            <Image
              src={option.img}
              alt={option.label}
              width={20}
              height={20}
              className="w-5 h-5 mr-2"
            />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CustomSelect
