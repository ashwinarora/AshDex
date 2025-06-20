'use client'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import arrowdownicon from '@/assets/images/arrowdown_icon.svg'
import { getSpotAssetContext } from '@/utils/utils'
import { useFavorites } from '@/context/FavoritesContext'
import Skeleton from '../../common/Skeleton'
import { IconExternalLink, IconSearch, IconStar, IconStarFilled } from '@tabler/icons-react'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import ReactiveText from '../../common/ReactiveText'
import SpotTable from './SpotTable'

interface ISelectorProps {
  selectedAsset: string
  setSelectedAsset: (asset: string) => void
}

const SpotSelector = ({ selectedAsset, setSelectedAsset }: ISelectorProps) => {
  const { spotAssetContext } = useHyperliquid()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('All')
  const [isStrict, setIsStrict] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [tokenContract, setTokenContract] = useState<string>()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { data: spotMeta } = useSpotMeta()

  const { context: selectedAssetContext, meta: selectedAssetToken } = useMemo(() => {
    if (spotMeta && spotAssetContext) {
      const spot = getSpotAssetContext({
        asset: selectedAsset,
        spotMeta,
        spotAssetContext
      })
      setTokenContract(spot?.meta?.tokenId)
      return { context: spot?.context, meta: spot?.meta }
    }
    return { context: null, meta: null }
  }, [selectedAsset, spotAssetContext, spotMeta])

  const tabs = ['All', 'Recently Listed', 'AI', 'Defi', 'Gaming', 'Meme']

  const marketData = useMemo(() => {
    if (!selectedAssetContext) return []

    const calculate24hChange = () => {
      if (!selectedAssetContext?.prevDayPx || !selectedAssetContext?.midPx) return null
      const prev = Number(selectedAssetContext.prevDayPx)
      const change = Number(selectedAssetContext.midPx) - prev
      const percent = (change / prev) * 100
      const sign = change >= 0 ? '+' : ''
      return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`
    }

    const changeString = calculate24hChange()

    return [
      {
        label: '24h Change',
        value: changeString ?? <Skeleton size="md" />,
        color: changeString?.includes('+') ? 'text-green' : 'text-red'
      },
      {
        label: '24h Volume',
        value: selectedAssetContext?.dayNtlVlm ? (
          <ReactiveText
            className="text-xs"
            precision={0}
            value={Number(selectedAssetContext?.dayNtlVlm)}
            type="currency"
          />
        ) : (
          <Skeleton size="md" />
        )
      },
      {
        label: 'Market Cap',
        value: selectedAssetContext?.midPx ? (
          <ReactiveText
            className="text-xs"
            precision={0}
            value={Number(Number(selectedAssetContext.midPx))}
            type="currency"
          />
        ) : (
          <Skeleton size="md" />
        )
      },
      {
        label: 'Contract',
        value: tokenContract ? (
          <div className="group flex gap-1 cursor-pointer">
            <a
              href={`https://app.hyperliquid.xyz/explorer/token/${tokenContract}`}
              target="_blank"
              className="text-white text-xs"
            >
              {tokenContract.slice(0, 6)}...{tokenContract.slice(-4)}
            </a>{' '}
            <IconExternalLink className="w-4 h-4 text-white/50 group-hover:text-primary" />
          </div>
        ) : (
          <Skeleton size="md" />
        )
      }
    ]
  }, [selectedAssetContext, tokenContract])

  // Memoize the favorite toggle handler
  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const assetPrice = Number(selectedAssetContext?.markPx)
      const change24hItem = marketData.find((i) => i.label === '24h Change')
      const change24hValue =
        typeof change24hItem?.value === 'string' ? change24hItem.value : '0.00%'
      toggleFavorite(
        {
          name: selectedAsset,
          value: assetPrice.toString(),
          index: selectedAsset,
          price: assetPrice,
          change24h: change24hValue
        },
        'spot'
      )
    },
    [selectedAssetContext, selectedAsset, marketData, toggleFavorite]
  )

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!panelRef.current || !panelRef.current.contains(target))
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [])

  return (
    <div ref={containerRef} className={`flex items-center ${isOpen ? 'z-50' : ''} nexon-card`}>
      <div className="flex max-xl:border-white/10 max-xl:border-b max-xl:w-full">
        <div className="flex items-center px-2">
          <button
            onClick={handleToggleFavorite}
            className="focus:outline-none w-5 h-5 text-primary hover:scale-105 cursor-pointer"
          >
            {isFavorite(selectedAsset, 'spot') ? (
              <IconStarFilled size={16} className="mr-1" />
            ) : (
              <IconStar size={16} className="opacity-50 mr-1 text-white" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen)
            }}
            className="flex items-center gap-x-2 text-white text-lg cursor-pointer disabled:opacity-50"
          >
            <div className="flex flex-col">
              <span className="text-white text-sm text-nowrap">
                {selectedAssetToken?.name || 'Select an asset'}
              </span>
            </div>
            <Image
              width={20}
              height={20}
              src={arrowdownicon}
              alt="arrowdown"
              className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
        <div className="flex flex-col p-4">
          <p className="text-white/70 text-xs">Price</p>
          <ReactiveText
            className="text-xs"
            precision={2}
            value={Number(selectedAssetContext?.markPx)}
            type="currency"
          />
        </div>
      </div>

      <div className="flex gap-4 text-white text-xs">
        {marketData?.map((item, index) => (
          <div key={index} className="flex flex-col flex-wrap justify-center">
            <div className="text-white/70 text-xs">{item.label}</div>
            <div className={`font-medium text-xs ${item.color || 'text-white'}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {isOpen && (
        <div
          ref={panelRef}
          className="top-9 left-2 z-50 absolute flex flex-col gap-3 bg-[#211134] shadow-xl mt-8 p-4 border-2 border-white/5 rounded-xl w-[90%] max-w-[95vw]"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center bg-[#FFFFFF08] px-4 border border-white/5 rounded-md w-full">
              <IconSearch className="w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder='e.g. "BTC" or "Bitcoin"'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent p-2 focus:outline-none w-full text-white text-sm"
              />
            </div>
            <div className="relative flex justify-between bg-white/5 m-3 p-1 py-3 rounded-md w-1/4 h-10 overflow-hidden">
              {/* Sliding background */}
              <div
                className={`absolute top-0 left-0 z-10 h-[100%]  w-1/2 rounded-md transition-all duration-200 ${
                  isStrict ? 'translate-x-0 bg-green' : 'translate-x-full bg-red'
                }`}
              ></div>

              {/* Buy Button */}
              <p
                className="z-20 flex justify-center items-center w-1/2 font-medium text-white text-sm cursor-pointer"
                onClick={() => setIsStrict(true)}
              >
                Strict
              </p>

              {/* Sell Button */}
              <p
                className="z-20 flex justify-center items-center w-1/2 font-medium text-white text-sm cursor-pointer"
                onClick={() => setIsStrict(false)}
              >
                All
              </p>
            </div>
          </div>

          <div className="flex gap-2 bg-white/2 px-3 py-2 rounded-md w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`text-white rounded-md transition-all duration-200 cursor-pointer py-1 px-3 ${
                  selectedTab === tab ? 'bg-primary font-medium' : 'hover:bg-[#FFFFFF20]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <SpotTable
            searchTerm={searchTerm}
            setSelectedAsset={(asset) => {
              setSelectedAsset(asset)
              setIsOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default SpotSelector
