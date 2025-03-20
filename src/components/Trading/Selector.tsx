'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useHyperLiquid } from '../../context/HyperLiquid'
import bitcoinlogo from '@/assets/images/bitcoin_logo.svg'
import settingicon from '@/assets/images/setting_icon.svg'
import arrowdownicon from '@/assets/images/arrowdown_icon.svg'
import starticon from '@/assets/images/star_icon.svg'

interface ISelectorProps {
  selectedAsset: string
  setSelectedAsset: (asset: string) => void
}

const Selector = ({ selectedAsset, setSelectedAsset }: ISelectorProps) => {
  const { allMids } = useHyperLiquid()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  // Filter assets based on the search term
  const assetEntries = useMemo(
    () =>
      Object.entries(allMids)
        .filter(([key]) => !key.startsWith('@'))
        .filter(([key]) => key.includes('PERP'))
        .filter(([key]) => key.toLowerCase().includes(searchTerm.toLowerCase())),
    [allMids, searchTerm]
  )

  const marketData = [
    { label: '24h Change', value: '+638 (+0.54%)', color: 'text-[#2FA766]' },
    { label: '24h High', value: '$99,149.00' },
    { label: '24h Low', value: '$99,149.00' },
    { label: '24h Volume (BTC)', value: '17,062.39' },
    { label: '24h Volume (USDT)', value: '1,635,613,349.18' },
    { label: 'Market Cap', value: '$928B' },
    { label: '1h Funding', value: '0.0015%' },
    { label: 'Next Funding', value: '27:57' }
  ]

  const settingsOptions = [
    { label: '24h High', checked: false },
    { label: '24h Low', checked: true },
    { label: 'Market Cap', checked: true },
    { label: 'Funding Rate', checked: true },
    { label: '24h Trades', checked: true },
    { label: '1h Funding', checked: true },
    { label: 'Next Funding', checked: true }
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative w-full my-0 rounded-2xl max-[770px]:block flex items-center shadow-md border-2 border-white/10 backdrop-blur-[40px] ${isOpen ? 'z-50' : ''}`}
      style={{
        background:
          'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
      }}
    >
      {/* Left Side */}
      <div className="flex max-[770px]:border-b max-[770px]:border-white/10">
        <div className="flex items-center max-[576px]:px-2 max-[770px]:px-6 px-1 2xl:p-4 gap-x-3 2xl:gap-x-4 border-r-1 border-white/10">
          <Image
            src={starticon}
            className="2xl:relative absolute -top-1 -left-1"
            alt="starticon"
            width={18}
            style={{height: 'auto', width: 'auto'}}
            height={18}
          />
          <Image src={bitcoinlogo} alt="Bitcoin Logo" width={32} style={{height: 'auto', width: 'auto'}} height={32} />
          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            className="text-lg text-white flex items-center gap-x-2 focus:outline-none cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="text-[#FFFFFF] font-bold text-base">
                {selectedAsset || 'Select an asset'}
              </span>
              <span className="text-[#E8E0F1] text-left opacity-60 text-[13px] font-medium">
                {'Bitcoin price'}
              </span>
            </div>
            <Image
              height={20}
              width={20}
              src={arrowdownicon}
              alt="arrowdown"
              className="w-3 h-3 mx-2"
            />
          </button>
        </div>
        <div className="flex flex-col max-[770px]:pl-3 items-center p-4 px-3 2xl:px-8 max-[576px]:border-r-0 border-r border-white/10">
          <span className="text-xl font-normal text-[#E2464A]">
            {selectedAsset && assetEntries?.find(([key]) => key === selectedAsset)?.[1]}
          </span>
          <span className="text-sm opacity-80 font-medium text-[#FFFFFF]">
            ${selectedAsset && assetEntries?.find(([key]) => key === selectedAsset)?.[1]}
          </span>
        </div>
      </div>

      <div className="flex items-center relative max-[770px]:px-3 px-6 py-3 max-[770px]:w-full w-[79%] justify-between">
        <div className="flex flex-wrap gap-2 2xl:gap-6 text-white text-sm">
          {marketData?.map((item, index) => (
            <div
              key={index}
              className="flex max-[770px]:pb-2 flex-wrap border-r-1 px-4 border-white/10 flex-col"
            >
              <span className="opacity-60 font-medium text-xs text-[#E8E0F1] ">{item.label}</span>
              <span className={`font-medium mt-1 text-sm ${item.color || 'text-[#FFFFFF]'}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
        <div ref={settingsRef} className="relative block max-[770px]:hidden">
          <button onClick={() => setIsSettingsOpen(prev => !prev)} className="mx-2 cursor-pointer">
            <Image
              src={settingicon}
              style={{height: 'auto', width: 'auto'}}
              alt="Settings"
              className="2xl:w-[20px] 2xl:h-[20px] max-[1025px]:w-8 max-[1025px]:h-8 w-6 h-6"
              width={24}
              height={24}
            />
          </button>
        </div>
        <button
          onClick={() => setIsSettingsOpen(prev => !prev)}
          className="mx-2 max-[770px]:block hidden absolute -top-15 right-0 cursor-pointer"
        >
          <Image src={settingicon} alt="Settings" className="w-5 h-5" width={24} height={24} />
        </button>
      </div>
      {/* Settings Dropdown */}
      {isSettingsOpen && (
        <div className="absolute -right-3 border-2 border-white/10 top-12 mt-2 w-48 bg-[#0F0816] rounded-2xl shadow-lg">
          <ul className="p-2 text-white">
            {settingsOptions?.map((option, index) => (
              <li
                key={index}
                className="flex items-center p-2 font-medium text-base cursor-pointer hover:bg-[#322944] rounded"
              >
                <input type="checkbox" className="mr-2" defaultChecked={option.checked} />
                <span>{option.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-20 2xl:top-[60px] mt-2 2xl:w-[13%] w-[20%] bg-[#2d1b55] rounded shadow-lg overflow-hidden">
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-2 bg-[#3a255f] text-white placeholder-gray-400 rounded-t focus:outline-none"
          />
          <ul className="max-h-60 overflow-auto">
            {assetEntries?.length > 0 ? (
              assetEntries.map(([key, value]) => (
                <li
                  key={key}
                  onClick={() => {
                    setSelectedAsset(key)
                    setIsOpen(false)
                    setSearchTerm('')
                  }}
                  className="p-3 flex text-sm justify-between hover:bg-[#4a2c70] cursor-pointer text-white"
                >
                  <span>{key}</span>
                  <span className="text-gray-300">{value}</span>
                </li>
              ))
            ) : (
              <li className="p-3 text-gray-400 text-center">No assets found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Selector
