'use client'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { getUniverseIndex } from '@/utils/utils'
import Image from 'next/image'
import { useEffect, useMemo } from 'react'
import Slider1 from '@/assets/images/slider_value.svg'
import CustomSelector from '../CustomSelector'

interface LeverageMarginProps {
  selectedAsset: string
  leverage: number
  setLeverage: React.Dispatch<React.SetStateAction<number>>
  isCross: boolean
  setIsCross: React.Dispatch<React.SetStateAction<boolean>>
}

const LeverageMargin = ({
  selectedAsset,
  leverage,
  setLeverage,
  isCross,
  setIsCross
}: LeverageMarginProps) => {
  const { universe } = useHyperLiquid()

  const maxLeverage = useMemo(() => {
    if (!universe) return 1
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
      <div className="mb-4 px-4">
        <label className="block text-sm font-medium text-gray-400">Leverage</label>
        <div className="flex justify-between items-center">
          <div className="w-4/6">
            <input
              type="range"
              min={1}
              max={maxLeverage}
              step={1}
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value, 10))}
              className="w-full cursor-pointer appearance-none h-2.5 rounded-lg outline-none"
              style={{
                background:
                  maxLeverage > 1
                    ? `linear-gradient(to right, #702DF5 0%, #702DF5 ${((leverage - 1) / (maxLeverage - 1)) * 100}%, #2A1B3D ${((leverage - 1) / (maxLeverage - 1)) * 100}%, #2A1B3D 100%)`
                    : '#2A1B3D'
              }}
              disabled={maxLeverage <= 1}
            />
            <Image src={Slider1} alt="" width={20} height={20} className="w-full mt-1" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1x</span>
              <span>{1 + (maxLeverage - 1) * 0.25}x</span>
              <span>{1 + (maxLeverage - 1) * 0.5}x</span>
              <span>{1 + (maxLeverage - 1) * 0.75}x</span>
              <span>{maxLeverage}x</span>
            </div>
          </div>
          <div className="flex items-center pl-4 space-x-3">
            <button
              onClick={() => setLeverage((prev) => Math.max(prev - 1, 1))}
              className="w-8 h-[58px] rounded-lg border border-white/10 bg-white/10 p-2 flex items-center justify-center text-white"
            >
              -
            </button>
            <span className="text-xl font-medium w-[40px] text-center">{leverage}x</span>
            <button
              onClick={() => setLeverage((prev) => Math.min(prev + 1, maxLeverage))}
              className="w-8 h-[58px] rounded-lg border border-white/10 bg-white/10 p-2 flex items-center justify-center text-white"
            >
              +
            </button>
          </div>
        </div>
      </div>
      <div className="px-4 border-b border-[#FFFFFF0F]">
        <div className="flex w-full justify-between items-center mb-4 px-4 border border-white/10 bg-white/10 rounded-md py-2">
          <p className="text-[#8B8BA0]">Margin Mode</p>
          <CustomSelector
            options={[
              { value: 'cross', label: 'Cross' },
              { value: 'isolated', label: 'Isolated' }
            ]}
            selectedValue={isCross ? 'cross' : 'isolated'}
            onChange={(value) => setIsCross(value === 'cross')}
          />
        </div>
      </div>
    </div>
  )
}

export default LeverageMargin
