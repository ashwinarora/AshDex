'use client'
import { getLeverageTicks, getUniverseIndex } from '@/utils/utils'

import { useEffect, useMemo } from 'react'

import { useHyperliquid } from '@/store/HyperliquidStore'

interface LeverageMarginProps {
  selectedAsset: string
  leverage: number
  setLeverage: React.Dispatch<React.SetStateAction<number>>
}

const LeverageMargin = ({ selectedAsset, leverage, setLeverage }: LeverageMarginProps) => {
  const { clearingHouseState, perpsMeta } = useHyperliquid()

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
    if (!perpsMeta?.universe.length) return 1
    const assetIndex = getUniverseIndex(perpsMeta?.universe || [], selectedAsset)
    return perpsMeta?.universe[assetIndex]?.maxLeverage || 1
  }, [perpsMeta, selectedAsset])

  // useful when user changes the asset
  useEffect(() => {
    if (maxLeverage < leverage) {
      setLeverage(maxLeverage)
    }
  }, [maxLeverage, setLeverage, leverage])

  return (
    <div className="px-3">
      <div className="flex justify-between items-center px-3 py-1 border border-white/10 rounded-md">
        <label className="block font-medium text-gray-400 text-xs">Leverage</label>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLeverage((prev) => Math.max(prev - 1, 1))}
              className="flex justify-center items-center bg-primary/20 active:bg-white/5 p-1 rounded-md w-6 h-6 aspect-square text-md text-white cursor-pointer"
            >
              -
            </button>
            <span className="w-8 font-medium text-sm text-center">{leverage}x</span>
            <button
              onClick={() => setLeverage((prev) => Math.min(prev + 1, maxLeverage))}
              className="flex justify-center items-center bg-primary/20 active:bg-white/5 p-1 rounded-md w-6 h-6 aspect-square text-md text-white cursor-pointer"
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
          className="[&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-webkit-slider-thumb]:border-none rounded-lg [&::-moz-range-thumb]:rounded-full [&::-webkit-slider-thumb]:rounded-full outline-none w-full [&::-moz-range-thumb]:w-3 [&::-webkit-slider-thumb]:w-3 h-0.5 [&::-moz-range-thumb]:h-3 [&::-webkit-slider-thumb]:h-3 appearance-none [&::-moz-range-thumb]:appearance-none [&::-webkit-slider-thumb]:appearance-none cursor-pointer [&::-moz-range-thumb]:cursor-pointer [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background:
              maxLeverage > 1
                ? `linear-gradient(to right, #5F46F9 0%, #5F46F9 ${((leverage - 1) / (maxLeverage - 1)) * 100}%, #2A1B3D ${((leverage - 1) / (maxLeverage - 1)) * 100}%, #2A1B3D 100%)`
                : '#2A1B3D'
          }}
          disabled={maxLeverage <= 1}
        />
        <div className="flex justify-between mt-0.5 text-gray-500 text-xs">
          {getLeverageTicks(maxLeverage, 3).map((value, index) => (
            <span key={`leverage-tick-${value}-${index}`}>{value}x</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LeverageMargin
