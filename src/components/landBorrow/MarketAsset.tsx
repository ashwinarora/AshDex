'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DropDown from '@/assets/images/tabler_chevron-down.svg'
import MarketTable from './components/MarketTable'
import Image from 'next/image'
import CheckBox from '../common/CheckBox'

const MarketAsset = () => {
  const settingsRef = useRef<HTMLDivElement>(null)
  const [selecterOpen, setSeleterOpen] = useState(false)

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
      setSeleterOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  const settingsOptions = useMemo(
    () => [
      { label: '24h High', checked: false },
      { label: '24h Low', checked: true },
      { label: 'Market Cap', checked: true },
      { label: 'Funding Rate', checked: true },
      { label: '24h Trades', checked: true },
      { label: '1h Funding', checked: true },
      { label: 'Next Funding', checked: true }
    ],
    []
  )

  return (
    <div className="bg-gradient-to-b from-white/5 via-gray-500/5 to-gray-500/5 border-2 border-white/10 backdrop-blur-[40px] px-4 py-5 rounded-lg mt-5">
      <div className="flex justify-between">
        <p>Market Asset</p>

        <div ref={settingsRef} className="relative">
          <button
            onClick={() => setSeleterOpen((prev) => !prev)}
            className="mx-2 cursor-pointer text-white bg-[#FFFFFF0F] flex py-3 px-6 rounded-xl"
            aria-label="Edit Settings"
          >
            <span>Edit</span>
            <Image src={DropDown} width={20} height={20} className="pl-1" alt="" />
          </button>

          {selecterOpen && (
            <div className="absolute right-0  top-10 w-48  shadow-lg z-10 bg-[#0F0816] border-2 border-white/10 rounded-2xl">
              <div className="max-h-[400px] overflow-y-auto">
                <ul className="p-2 text-white">
                  {settingsOptions.map((option, index) => (
                    <li
                      key={index}
                      className="flex items-center p-2 font-medium text-base cursor-pointer my-2 bg-[#FFFFFF0F] rounded"
                    >
                      <CheckBox label={option.label} isChecked={option.checked} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      <MarketTable />
    </div>
  )
}

export default MarketAsset
