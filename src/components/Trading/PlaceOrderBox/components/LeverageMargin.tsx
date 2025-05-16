'use client'
import { getUniverseIndex } from '@/utils/utils'
import Image from 'next/image'
import { useEffect, useMemo } from 'react'
import Slider1 from '@/assets/images/slider_value.svg'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'

interface LeverageMarginProps {
  selectedAsset: string
  leverage: number
  setLeverage: React.Dispatch<React.SetStateAction<number>>
}

const LeverageMargin = ({ selectedAsset, leverage, setLeverage }: LeverageMarginProps) => {
  const { data: universe } = usePerpsUniverse()

  const maxLeverage = useMemo(() => {
    if (!universe.length) return 1
    const assetIndex = getUniverseIndex(universe, selectedAsset)
    return universe?.[assetIndex]?.maxLeverage || 1
  }, [universe, selectedAsset])

  // useful when user changes the asset
  useEffect(() => {
    if (maxLeverage < leverage) {
      setLeverage(maxLeverage)
    }
  }, [maxLeverage, setLeverage, leverage])

  return (
    <div>
      <div className="mb-1 px-4">
        <label className="block text-xs font-medium text-gray-400">Leverage</label>
        <div className="flex justify-between items-center">
          <div className="w-[70%]">
            <input
              type="range"
              min={1}
              max={maxLeverage}
              step={1}
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value, 10))}
              className="w-full cursor-pointer appearance-none h-2 rounded-lg outline-none
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:h-3
    [&::-webkit-slider-thumb]:w-3
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-white
    [&::-webkit-slider-thumb]:cursor-pointer
    [&::-webkit-slider-thumb]:border-none
    [&::-moz-range-thumb]:appearance-none
    [&::-moz-range-thumb]:h-3
    [&::-moz-range-thumb]:w-3
    [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:bg-white
    [&::-moz-range-thumb]:cursor-pointer
    [&::-moz-range-thumb]:border-none"
              style={{
                background:
                  maxLeverage > 1
                    ? `linear-gradient(to right, #5F46F9 0%, #5F46F9 ${((leverage - 1) / (maxLeverage - 1)) * 100}%, #2A1B3D ${((leverage - 1) / (maxLeverage - 1)) * 100}%, #2A1B3D 100%)`
                    : '#2A1B3D'
              }}
              disabled={maxLeverage <= 1}
            />
            <Image src={Slider1} alt="Slider1" width={20} height={20} className="w-full mt-0.5" />
            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
              <span>1x</span>
              <span>{1 + (maxLeverage - 1) * 0.25}x</span>
              <span>{1 + (maxLeverage - 1) * 0.5}x</span>
              <span>{1 + (maxLeverage - 1) * 0.75}x</span>
              <span>{maxLeverage}x</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLeverage((prev) => Math.max(prev - 1, 1))}
              className="w-6 h-8 rounded-md border border-white/10 bg-white/10 p-1 flex items-center justify-center text-white text-md"
            >
              -
            </button>
            <span className="text-sm font-medium w-8 text-center">{leverage}x</span>
            <button
              onClick={() => setLeverage((prev) => Math.min(prev + 1, maxLeverage))}
              className="w-6 h-8 rounded-md border border-white/10 bg-white/10 p-1 flex items-center justify-center text-white text-md"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeverageMargin
