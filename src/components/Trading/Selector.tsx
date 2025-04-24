'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import { useHyperLiquid } from '../../context/HyperLiquid'
import bitcoinlogo from '@/assets/images/bitcoin_logo.svg'
import settingicon from '@/assets/images/setting_icon.svg'
import arrowdownicon from '@/assets/images/arrowdown_icon.svg'

import AssetItem from './UserData/component/AssetItem'
import { getUniverseIndex } from '@/utils/utils'
import ValueIndicator from '../common/ValueIndicator'
import useIsSpot from '@/hooks/useIsSpot'

import { useFavorites } from '@/context/FavoritesContext'

// Crypto icons imports
import btcIcon from '@/assets/images/bitcoin_logo.svg'
import Skeleton from '../common/Skeleton'
import { IconArrowsSort, IconStar, IconStarFilled } from '@tabler/icons-react'

// Crypto icon mapping - only include Bitcoin which we know exists
const CRYPTO_ICONS: Record<string, StaticImageData> = {
  'BTC-PERP': btcIcon
}

interface ISelectorProps {
  selectedAsset: string
  setSelectedAsset: (asset: string) => void
}

const Selector = ({ selectedAsset, setSelectedAsset }: ISelectorProps) => {
  const { allMids, perpAssetContext, universe, spotAssetContext } = useHyperLiquid()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('All')
  const containerRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const isSpot = useIsSpot()
  const type = isSpot ? 'spot' : 'perp'
  const selectedAssetContext = useMemo(() => {
    if (isSpot) {
      const asset = spotAssetContext.find((assets) => assets.coin.includes(selectedAsset))
      return asset
    } else {
      const assetIndex = getUniverseIndex(universe, selectedAsset)
      return perpAssetContext[assetIndex]
    }
  }, [selectedAsset, perpAssetContext, universe, spotAssetContext, isSpot])

  // Get and filter asset entries based on searchTerm and "PERP"
  const filteredAssets = useMemo(
    () =>
      Object.entries(allMids)
        .filter(([key]) => !key.startsWith('@'))
        .filter(([key]) => key.includes(isSpot ? 'SPOT' : 'PERP'))
        .filter(([key]) => key.toLowerCase().includes(searchTerm.toLowerCase())),
    [allMids, searchTerm]
  )

  const tabs = ['All', 'Recently Listed', 'AI', 'Defi', 'Gaming', 'Meme']

  const marketData = useMemo(() => {
    if (!selectedAssetContext) return []
    const calculate24hChange = () => {
      if (!selectedAssetContext?.prevDayPx || !selectedAssetContext?.midPx) return null
      const prevDayPrice = selectedAssetContext?.prevDayPx
      const change = selectedAssetContext.midPx - prevDayPrice
      const percentageChange = (change / prevDayPrice) * 100
      const sign = change >= 0 ? '+' : ''
      return `${sign}${change.toFixed(2)} (${sign}${percentageChange.toFixed(2)}%)`
    }
    const changeString = calculate24hChange()
    const data = [
      {
        label: '24h Change',
        value: changeString ?? <Skeleton size="md" />,
        color: changeString
          ? changeString.includes('+')
            ? 'text-[#2FA766]'
            : 'text-[#E2464A]'
          : ''
      },
      { label: '24h High', value: '$99,149.00' },
      { label: '24h Low', value: '$99,149.00' },
      {
        label: '24h Volume (BTC)',
        value: selectedAssetContext?.dayBaseVlm.toFixed(2) ?? <Skeleton size="md" />
      },
      {
        label: '24h Volume (USDT)',
        value: selectedAssetContext?.dayNtlVlm.toFixed(2) ?? <Skeleton size="md" />
      },
      { label: 'Market Cap', value: '$928B' },
      { label: 'Next Funding', value: '27:57' }
    ]
    if ('funding' in selectedAssetContext) {
      data.splice(data.length - 1, 0, {
        label: '1h Funding',
        value: selectedAssetContext?.funding.toString() ?? <Skeleton size="md" />,
        color: 'text-[#2FA766]'
      })
    }
    return data
  }, [selectedAssetContext])

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

  const { isFavorite, toggleFavorite } = useFavorites()

  const isFav = isFavorite(selectedAsset, type)

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()

    // Ensure we have valid values to save
    const assetPrice = selectedAssetContext?.midPx
      ? String(selectedAssetContext.midPx)
      : String(allMids[selectedAsset] || '0')

    // Get the 24h change value
    const change24hItem = marketData?.find((item) => item.label === '24h Change')
    const change24hValue =
      typeof change24hItem?.value === 'string' || typeof change24hItem?.value === 'number'
        ? change24hItem.value
        : '0.00%'

    toggleFavorite(
      {
        name: selectedAsset,
        value: assetPrice,
        index: selectedAsset,
        price: assetPrice,
        change24h: change24hValue
      },
      type
    )
  }

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
      className={`relative w-full my-0 rounded-2xl max-xl:block flex items-center shadow-md border-2 border-white/10 backdrop-blur-[40px] ${
        isOpen || isSettingsOpen ? 'z-50' : ''
      }`}
      style={{
        background:
          'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
      }}
    >
      {/* Left Side */}
      <div className="flex max-xl:border-b max-xl:border-white/10 max-xl:w-full">
        <div className="flex items-center max-sm:px-2 max-lg:px-6 px-1 2xl:p-4 gap-x-3 2xl:gap-x-3 border-r-1 border-white/10">
          <button
            onClick={handleToggleFavorite}
            className="text-yellow-500 hover:text-yellow-600 focus:outline-none cursor-pointer   md:static absolute -top-2 -left-2 h-5 w-5"
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite(selectedAsset, type) ? (
              <IconStarFilled size={16} className="mr-1" />
            ) : (
              <IconStar size={16} className="mr-1" />
            )}
          </button>
          <Image src={bitcoinlogo} alt="Bitcoin Logo" width={32} height={32} />
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-lg text-white flex items-center gap-x-2 focus:outline-none cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="text-[#FFFFFF] font-bold text-base text-nowrap">
                {selectedAsset || 'Select an asset'}
              </span>
              <span className="text-[#E8E0F1] text-left opacity-60 text-[13px] font-medium hidden">
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
        <div className="flex flex-col max-lg:pl-3 items-center p-4 px-3 2xl:px-5 max-sm:border-r-0 border-r border-white/10 min-w-32">
          <ValueIndicator value={selectedAssetContext?.midPx} className="text-xl font-normal" />
        </div>
      </div>

      <div className="flex items-center relative max-xl:w-full w-[80%] justify-between">
        <div className="flex flex-wrap 2xl:gap-6 text-white text-sm divide-x max-lg:divide-y divide-white/10 divide">
          {marketData?.map((item, index) => (
            <div
              key={index}
              className="flex max-lg:pb-2 py-3 flex-wrap flex-1 max-lg:px-2 px-4 flex-col justify-center space-y-2 relative"
            >
              <div className="flex flex-col space-y-1">
                <div className="opacity-60 font-medium text-xs text-[#E8E0F1] text-nowrap">
                  {item.label}
                </div>
                <div
                  className={`font-medium md:text-sm text-xs    ${item.color || 'text-[#FFFFFF]'}`}
                >
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div ref={settingsRef} className="relative block max-lg:hidden pr-4">
          <button
            onClick={() => setIsSettingsOpen((prev) => !prev)}
            className="mx-2 cursor-pointer"
          >
            <Image src={settingicon} alt="Settings" className="w-6 h-6" width={24} height={24} />
          </button>
        </div>
        <button
          onClick={() => setIsSettingsOpen((prev) => !prev)}
          className="mx-2 max-lg:block hidden absolute -top-12 right-0 cursor-pointer"
        >
          <Image src={settingicon} alt="Settings" className="w-5 h-5" width={24} height={24} />
        </button>
      </div>
      {/* Settings Dropdown */}
      {isSettingsOpen && (
        <div className="absolute -right-3 border-2 border-white/10 top-12 mt-2 w-48 bg-secondary rounded-2xl shadow-lg">
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
        <div className="absolute left-0 top-12  z-50 w-[800px] max-w-[95vw] bg-secondary rounded-xl shadow-xl overflow-hidden mt-8 -ml-1 border-2 border-white/5 ">
          {/* Search Input */}
          <div className="p-4">
            <div className="border-2 border-[#FFFFFF15] bg-[#FFFFFF08] rounded-md flex items-center px-4 py-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                  stroke="#8B8BA0"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="#8B8BA0"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                placeholder='e.g. "BTC" or "Bitcoin"'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 text-white placeholder-gray-400 bg-transparent focus:outline-none text-sm font-proxima-nova"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex px-4 pb-3 space-x-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`md:py-2  md:px-5 px-2 py-0    rounded-full transition-all duration-200 cursor-pointer ${
                  selectedTab === tab
                    ? 'text-secondary bg-white/80  font-medium'
                    : 'text-white   bg-white/5 hover:bg-[#FFFFFF20]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Table Headers */}
          <div className="overflow-auto">
            <div className="flex text-left px-4 py-3 border-t border-b border-[#FFFFFF10] bg-secondary text-[#8B8BA0] sticky top-0 text-sm font-medium">
              <div className="w-1/12"></div> {/* Checkbox column */}
              <div className="w-3/12">Market</div>
              <div className="w-2/12 text-right cursor-pointer whitespace-nowrap flex items-center justify-center">
                <IconArrowsSort className="w-4 h-4" /> Leverage
              </div>
              <div className="w-2/12 text-right cursor-pointer whitespace-nowrap flex items-center justify-center">
                <IconArrowsSort className="w-4 h-4" /> Price
              </div>
              <div className="w-2/12 text-right cursor-pointer whitespace-nowrap flex items-center justify-center">
                <IconArrowsSort className="w-4 h-4" /> 24h Change
              </div>
              <div className="w-2/12 text-right cursor-pointer whitespace-nowrap flex items-center justify-center">
                <IconArrowsSort className="w-4 h-4" /> Volume
              </div>
              <div className="w-2/12 text-right pr-4 cursor-pointer whitespace-nowrap flex items-center justify-end">
                <IconArrowsSort className="w-4 h-4" /> Market Cap
              </div>
            </div>

            {/* Asset List */}
            <div className="max-h-[400px] gap-2 flex flex-col p-2 overflow-y-auto gap-y-2">
              {filteredAssets.length > 0 ? (
                <>
                  {/* Favorite Assets Section */}
                  <div className="  flex flex-col gap-y-2">
                    {filteredAssets
                      .filter(([key]) => isFavorite(key, type))
                      .map(([key, value]) => {
                        // Find the asset context for this asset
                        const assetIndex = universe.findIndex((asset) => asset.name === key)
                        const assetCtx = assetIndex !== -1 ? perpAssetContext[assetIndex] : null

                        // Calculate formatted 24h change
                        let change24h = '0.00%'
                        if (assetCtx?.prevDayPx && assetCtx?.midPx) {
                          const prevDayPrice = assetCtx.prevDayPx
                          const currentPrice = assetCtx.midPx
                          const change = currentPrice - prevDayPrice
                          const percentageChange = (change / prevDayPrice) * 100
                          const isPositive = percentageChange >= 0
                          change24h = `${isPositive ? '+' : ''}${percentageChange.toFixed(1)}%`
                        }

                        return (
                          <AssetItem
                            key={key}
                            assetKey={key}
                            value={value}
                            selectedAsset={selectedAsset}
                            setSelectedAsset={handleAssetSelect}
                            icons={CRYPTO_ICONS}
                            isInSelectorDropdown={true}
                            price={value}
                            change24h={change24h}
                            type={type}
                          />
                        )
                      })}
                  </div>

                  {/* All Assets Section */}
                  <div className="flex flex-col gap-y-2">
                    {filteredAssets
                      .filter(([key]) => !isFavorite(key, type))
                      .map(([key, value]) => {
                        // Find the asset context for this asset
                        const assetIndex = universe.findIndex((asset) => asset.name === key)
                        const assetCtx = assetIndex !== -1 ? perpAssetContext[assetIndex] : null

                        // Calculate formatted 24h change
                        let change24h = '0.00%'
                        if (assetCtx?.prevDayPx && assetCtx?.midPx) {
                          const prevDayPrice = assetCtx.prevDayPx
                          const currentPrice = assetCtx.midPx
                          const change = currentPrice - prevDayPrice
                          const percentageChange = (change / prevDayPrice) * 100
                          const isPositive = percentageChange >= 0
                          change24h = `${isPositive ? '+' : ''}${percentageChange.toFixed(1)}%`
                        }

                        return (
                          <AssetItem
                            key={key}
                            assetKey={key}
                            value={value}
                            selectedAsset={selectedAsset}
                            setSelectedAsset={handleAssetSelect}
                            icons={CRYPTO_ICONS}
                            isInSelectorDropdown={true}
                            price={value}
                            change24h={change24h}
                            type={type}
                          />
                        )
                      })}
                  </div>
                </>
              ) : (
                <div className="p-6 text-center text-gray-400">No assets found.</div>
              )}
            </div>
          </div>

          {/* Apply Button */}
          <div className="p-4 bg-secondary hidden">
            <button
              onClick={() => {
                // Handle selection confirmation
                if (selectedAsset) {
                  setSelectedAsset(selectedAsset)
                }
                setIsOpen(false)
                setSearchTerm('')
              }}
              className="w-full py-3 bg-[#6366F1] text-white font-medium text-lg rounded-lg hover:bg-[#5558EA] transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Selector
