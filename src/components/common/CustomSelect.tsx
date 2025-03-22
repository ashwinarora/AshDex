import { useState, useRef, useEffect } from 'react'

type CryptoOption = {
  id: string
  label: string
  value: string
  icon: React.ReactNode
}

const options: CryptoOption[] = [
  {
    id: '1',
    label: 'BTC',
    value: 'BTC',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fillRule="evenodd">
          <circle cx="16" cy="16" r="16" fill="#F7931A" />
          <path
            fill="#FFF"
            fillRule="nonzero"
            d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.53-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"
          />
        </g>
      </svg>
    )
  },
  {
    id: '2',
    label: 'USDC',
    value: 'usdc',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 24C18.65 24 24 18.65 24 12C24 5.34996 18.65 0 12 0C5.34996 0 0 5.34996 0 12C0 18.65 5.34996 24 12 24Z"
          fill="#2775CA"
        />
        <path
          d="M15.3001 13.8996C15.3001 12.1496 14.2501 11.5496 12.1501 11.2997C10.6501 11.0996 10.3501 10.6997 10.3501 9.99961C10.3501 9.29953 10.8501 8.84965 11.8501 8.84965C12.7501 8.84965 13.2501 9.14965 13.5001 9.89965C13.5501 10.0496 13.7001 10.1496 13.8501 10.1496H14.65C14.8501 10.1496 15.0001 9.99961 15.0001 9.79969V9.74965C14.8 8.64961 13.9 7.79965 12.7501 7.69969V6.49969C12.7501 6.29965 12.6001 6.14965 12.3501 6.09961H11.6001C11.4001 6.09961 11.2501 6.24961 11.2 6.49969V7.64965C9.70002 7.84969 8.7501 8.84965 8.7501 10.0997C8.7501 11.7497 9.75006 12.3996 11.8501 12.6497C13.2501 12.8996 13.7001 13.1996 13.7001 13.9997C13.7001 14.7997 13 15.3497 12.0501 15.3497C10.75 15.3497 10.3 14.7996 10.15 14.0496C10.1001 13.8497 9.9501 13.7496 9.8001 13.7496H8.95002C8.7501 13.7496 8.6001 13.8996 8.6001 14.0996V14.1497C8.80002 15.3996 9.60006 16.2996 11.2501 16.5497V17.7497C11.2501 17.9496 11.4001 18.0996 11.65 18.1496H12.4C12.6001 18.1496 12.7501 17.9996 12.8001 17.7497V16.5497C14.3001 16.2996 15.3001 15.2496 15.3001 13.8996Z"
          fill="white"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M5.00004 9.54992C3.54996 13.4 5.55 17.75 9.45 19.1499C9.6 19.25 9.75 19.4499 9.75 19.5999V20.3C9.75 20.4 9.75 20.45 9.69996 20.4999C9.65004 20.7 9.45 20.7999 9.24996 20.7C6.45 19.8 4.29996 17.6499 3.39996 14.85C1.89996 10.1 4.5 5.04992 9.24996 3.54992C9.3 3.5 9.39996 3.5 9.45 3.5C9.65004 3.54992 9.75 3.69992 9.75 3.89996V4.59992C9.75 4.85 9.65004 5 9.45 5.09996C7.40004 5.84996 5.75004 7.44992 5.00004 9.54992ZM14.3 3.74996C14.35 3.54992 14.55 3.44996 14.75 3.54992C17.5 4.44992 19.7 6.59996 20.6 9.44996C22.1 14.1999 19.5 19.25 14.75 20.75C14.7 20.7999 14.6 20.7999 14.55 20.7999C14.35 20.75 14.25 20.6 14.25 20.4V19.7C14.25 19.4499 14.35 19.2999 14.55 19.2C16.6 18.45 18.25 16.85 19 14.75C20.45 10.8999 18.45 6.54992 14.55 5.15C14.4 5.04992 14.25 4.85 14.25 4.64996V3.95C14.25 3.84992 14.25 3.8 14.3 3.74996Z"
          fill="white"
        />
      </svg>
    )
  }
]
const CustomSelect = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<CryptoOption | null>(options[0])
  const selectRef = useRef<HTMLDivElement>(null)
  const nativeSelectRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleNativeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value
    const option = options.find((opt) => opt.value === selectedValue) || null
    setSelectedOption(option)
  }

  const handleCustomSelectChange = (option: CryptoOption) => {
    setSelectedOption(option)
    setIsOpen(false)

    if (nativeSelectRef.current) {
      nativeSelectRef.current.value = option.value

      const event = new Event('change', { bubbles: true })
      nativeSelectRef.current.dispatchEvent(event)
    }
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <div className="relative w-full" ref={selectRef}>
          <select
            ref={nativeSelectRef}
            className="sr-only"
            onChange={handleNativeSelectChange}
            aria-label="Select cryptocurrency"
          >
            {options.map((option) => (
              <option
                key={option.id}
                value={option.value}
                selected={selectedOption?.value === option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div
            className="flex items-center justify-between w-full py-2 px-2 rounded text-[#8B8BA0] border-2 border-[#FFFFFF0F] focus:outline-none focus:none focus:none"
            onClick={toggleDropdown}
            tabIndex={0}
            role="button"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <div className="flex items-center">
              {selectedOption ? (
                <>
                  <div className="mr-3">{selectedOption.icon}</div>
                  <span className="text-white">{selectedOption.label}</span>
                </>
              ) : (
                <span className="text-gray-500">Select a cryptocurrency</span>
              )}
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {isOpen && (
            <ul
              className="absolute z-10 w-full mt-1 bg-black border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto"
              role="listbox"
            >
              {options.map((option) => (
                <li
                  key={option.id}
                  role="option"
                  aria-selected={selectedOption?.id === option.id}
                  className={`flex items-center p-3 cursor-pointer transition-colors 
          ${selectedOption?.id === option.id ? 'bg-gray-800' : 'bg-black'} 
          hover:bg-gray-700 text-white`}
                  onClick={() => handleCustomSelectChange(option)}
                >
                  <div className="mr-3">{option.icon}</div>
                  <span className="text-white">{option.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomSelect
