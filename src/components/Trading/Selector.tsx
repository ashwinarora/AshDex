'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useHyperLiquid } from '../../context/HyperLiquid'
import { useTokenDetails } from '@/hooks/useTokenDetails'
import bitcoinlogo from '@/assets/images/bitcoin_logo.svg'
import settingicon from '@/assets/images/setting_icon.svg'
import arrowdownicon from '@/assets/images/arrowdown_icon.svg'
import starticon from '@/assets/images/star_icon.svg'
import SearchIcon from '@/assets/images/search-normal.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'
import AssetItem from './UserData/component/AssetItem'

interface ISelectorProps {
  selectedAsset: string
  setSelectedAsset: (asset: string) => void
}

const Selector = ({ selectedAsset, setSelectedAsset }: ISelectorProps) => {
  const { allMids, sdk } = useHyperLiquid()
  const { data: tokenDetails } = useTokenDetails(sdk, [], selectedAsset)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('All')
  const containerRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  // Get and filter asset entries based on searchTerm and "PERP"
  const assetEntries = useMemo(
    () =>
      Object.entries(allMids)
        .filter(([key]) => !key.startsWith('@'))
        .filter(([key]) => key.includes('PERP'))
        .filter(([key]) => key.toLowerCase().includes(searchTerm.toLowerCase())),
    [allMids, searchTerm]
  )

  // Use the full filtered list of assets
  const filteredAssets = assetEntries.filter(([key]) =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = [
    { name: 'Market', showIcon: false },
    { name: 'Price', showIcon: true },
    { name: '24h Change', showIcon: true },
    { name: '24h Volume', showIcon: true },
    { name: 'Market Cap', showIcon: true }
  ]

  const tabs = ['All', 'Recently Listed', 'AI', 'Defi', 'Gaming', 'Meme']

  const marketData = useMemo(
    () => [
      { label: '24h Change', value: '+638 (+0.54%)', color: 'text-[#2FA766]' },
      { label: '24h High', value: '$99,149.00' },
      { label: '24h Low', value: '$99,149.00' },
      { label: '24h Volume (BTC)', value: tokenDetails?.volume ?? '0' },
      { label: '24h Volume (USDT)', value: '1,635,613,349.18' },
      { label: 'Market Cap', value: '$928B' },
      { label: '1h Funding', value: tokenDetails?.funding ?? '0' },
      { label: 'Next Funding', value: '27:57' }
    ],
    [tokenDetails]
  )

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

  const handleAssetSelect = (assetKey: string) => {
    setSelectedAsset(assetKey)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full my-0 rounded-2xl max-[1100px]:block flex items-center shadow-md border-2 border-white/10 backdrop-blur-[40px] ${
        isOpen || isSettingsOpen ? 'z-50' : ''
      }`}
      style={{
        background:
          'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
      }}
    >
      {/* Left Side */}
      <div className="flex max-[1100px]:border-b max-[1100px]:border-white/10 max-[1100px]:w-full">
        <div className="flex items-center max-[576px]:px-2 max-[770px]:px-6 px-1 2xl:p-4 gap-x-3 2xl:gap-x-3 border-r-1 border-white/10">
          <Image
            src={starticon}
            className="2xl:relative absolute -top-1 -left-1 h-5 w-5"
            alt="starticon"
            width={18}
            height={18}
          />
          <Image src={bitcoinlogo} alt="Bitcoin Logo" width={32} height={32} />
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-lg text-white flex items-center gap-x-2 focus:outline-none cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="text-[#FFFFFF] font-bold text-base">
                {selectedAsset || 'Select an asset'}
              </span>
              <span className="text-[#E8E0F1] text-left opacity-60 text-[13px] font-medium">
                Bitcoin price
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
        <div className="flex flex-col max-[770px]:pl-3 items-center p-4 px-3 2xl:px-5 max-[576px]:border-r-0 border-r border-white/10 min-w-32">
          <span className="text-xl font-normal text-[#E2464A]">
            {selectedAsset && assetEntries?.find(([key]) => key === selectedAsset)?.[1]}
          </span>
          <span className="text-sm opacity-80 font-medium text-[#FFFFFF]">
            ${selectedAsset && assetEntries?.find(([key]) => key === selectedAsset)?.[1]}
          </span>
        </div>
      </div>

      <div className="flex items-center relative max-[1100px]:w-full w-[80%] justify-between">
        <div className="flex flex-wrap 2xl:gap-6 text-white text-sm divide-x max-[770px]:divide-y divide-white/10 divide">
          {marketData?.map((item, index) => (
            <div
              key={index}
              className="flex max-[770px]:pb-2 py-3 flex-wrap flex-1 max-[770px]:px-2 px-4 flex-col justify-center space-y-2 relative"
            >
              <div className="flex flex-col space-y-1">
                <div className="opacity-60 font-medium text-xs text-[#E8E0F1]">{item.label}</div>
                <div className={`font-medium md:text-sm text-xs ${item.color || 'text-[#FFFFFF]'}`}>
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div ref={settingsRef} className="relative block max-[770px]:hidden pr-4">
          <button
            onClick={() => setIsSettingsOpen((prev) => !prev)}
            className="mx-2 cursor-pointer"
          >
            <Image src={settingicon} alt="Settings" className="w-6 h-6" width={24} height={24} />
          </button>
        </div>
        <button
          onClick={() => setIsSettingsOpen((prev) => !prev)}
          className="mx-2 max-[770px]:block hidden absolute -top-12 right-0 cursor-pointer"
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
      {isOpen && (
        <div className="absolute left-0 top-12 2xl:top-[60px] my-2 xl:w-[40%] w-[90%] bg-[#0F0816] rounded-lg shadow-lg overflow-hidden mt-10 -ml-1">
          <div className="border-2 border-[#FFFFFF0F] bg-[#FFFFFF0F] m-2 px-2 py-1 flex rounded-md">
            <Image src={SearchIcon} alt="Search" />
            <input
              type="text"
              placeholder="e.g. 'BTC' or 'Bitcoin'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 text-white placeholder-gray-400 bg-transparent focus:outline-none"
            />
          </div>

          <div className="flex mx-3 border-b border-[#FFFFFF0F] space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`py-1 px-3 my-2 text-base rounded-2xl transition-all duration-200 cursor-pointer ${
                  selectedTab === tab
                    ? 'text-[#0F0816] bg-[#E8E0F1]'
                    : 'text-[#E8E0F1] bg-[#FFFFFF0F]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="overflow-auto">
            <div className="flex text-left bg-[#0F0816] px-4 py-2 text-[#8B8BA0] sticky top-0 text-sm whitespace-nowrap sm:w-full w-[200%]">
              {columns.map((col, index) => (
                <div
                  key={index}
                  className={`flex items-center ${col.showIcon ? 'w-28' : 'min-w-56'} `}
                >
                  {col.showIcon && (
                    <Image src={shortingicon} alt="Sort" className="w-3 h-3 mx-1.5" />
                  )}
                  <p className="text-wrap">{col.name}</p>
                </div>
              ))}
            </div>
            <div className="overflow-y-auto max-h-96 sm:w-full w-[200%]">
              {filteredAssets.length > 0 ? (
                filteredAssets.map(([key, value]) => (
                  <div key={key} onClick={() => handleAssetSelect(key)}>
                    <AssetItem
                      assetKey={key}
                      value={value}
                      selectedAsset={selectedAsset}
                      setSelectedAsset={() => handleAssetSelect(key)}
                    />
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400">No assets found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Selector
