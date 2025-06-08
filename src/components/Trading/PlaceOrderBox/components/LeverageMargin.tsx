'use client'
import { getUniverseIndex } from '@/utils/utils'

import { useEffect, useMemo } from 'react'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import { useHyperliquid } from '@/store/HyperliquidStore'

interface LeverageMarginProps {
  selectedAsset: string
  leverage: number
  setLeverage: React.Dispatch<React.SetStateAction<number>>
}

const LeverageMargin = ({ selectedAsset, leverage, setLeverage }: LeverageMarginProps) => {
  const { data: universe } = usePerpsUniverse()
  const { clearingHouseState } = useHyperliquid()

  // set the leverage to the existing position leverage
  useEffect(() => {
    const existingPosition = clearingHouseState?.assetPositions.find((pos) => {
      return pos.position.coin === selectedAsset
    })
    if (existingPosition) {
      setLeverage(existingPosition.position.leverage.value)
    }
  }, [])

  const maxLeverage = useMemo(() => {
    if (!universe.length) return 1
    const assetIndex = getUniverseIndex(universe, selectedAsset)
    return universe?.[assetIndex]?.maxLeverage || 1
  }, [universe, selectedAsset])

  const getLeverageIndicators = useMemo(() => {
    if (maxLeverage <= 1) return [1]
    if (maxLeverage <= 3) return [1, 2, 3]
    if (maxLeverage <= 5) return [1, 2, 3, 4, 5]
    if (maxLeverage <= 10) return [1, 5, 10]

    if (maxLeverage <= 20) return [1, 5, 10, 15, 20]

    if (maxLeverage <= 25) return [1, 5, 10, 15, 20, 25]

    if (maxLeverage <= 30) return [1, 5, 15, 20, 25, 30]
    if (maxLeverage <= 40) return [1, 10, 20, 30, 40]
    if (maxLeverage <= 50) return [1, 10, 25, 40, 50]
    if (maxLeverage <= 100) return [1, 25, 50, 75, 100]
    return [1, 25, 50, 75, 100]
  }, [maxLeverage])

  // useful when user changes the asset
  useEffect(() => {
    if (maxLeverage < leverage) {
      setLeverage(maxLeverage)
    }
  }, [maxLeverage, setLeverage, leverage])

  return (
    <div className="px-3">
      <div className="flex items-center justify-between px-3 py-1 border rounded-md border-white/10">
        <label className="block text-xs font-medium text-gray-400">Leverage</label>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLeverage((prev) => Math.max(prev - 1, 1))}
              className="flex items-center justify-center w-6 h-6 p-1 text-white rounded-md cursor-pointer bg-primary/20 text-md aspect-square active:bg-white/5"
            >
              -
            </button>
            <span className="w-8 text-sm font-medium text-center">{leverage}x</span>
            <button
              onClick={() => setLeverage((prev) => Math.min(prev + 1, maxLeverage))}
              className="flex items-center justify-center w-6 h-6 p-1 text-white rounded-md cursor-pointer bg-primary/20 text-md aspect-square active:bg-white/5"
            >
              +
            </button>
          </div>
        </div>
      </div>
      <div className="w-full">
        <input
          type="range"
          min={1}
          max={maxLeverage}
          step={1}
          value={leverage}
          onChange={(e) => setLeverage(parseInt(e.target.value, 10))}
          className="w-full cursor-pointer appearance-none h-0.5 rounded-lg outline-none
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
        <div className="flex justify-between text-xs text-gray-500 mt-0.5">
          {getLeverageIndicators.map((value) => (
            <span key={value}>{value}x</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LeverageMargin
