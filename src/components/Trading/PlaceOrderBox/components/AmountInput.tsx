'use client'

import { useHyperLiquid } from '@/context/HyperLiquid'
import { getCoinName, getUniverseIndex } from '@/utils/utils'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import Slider1 from '@/assets/images/slider_value.svg'

interface AmountInputProps {
  selectedAsset: string
  assetAmount: string
  setAssetAmount: React.Dispatch<React.SetStateAction<string>>
  usdAmount: string
  setUsdAmount: React.Dispatch<React.SetStateAction<string>>
  limitPrice: string
  isReduceOnly: boolean
  isBuy: boolean
}

const AmountInput = ({
  selectedAsset,
  assetAmount,
  setAssetAmount,
  usdAmount,
  setUsdAmount,
  limitPrice,
  isReduceOnly,
  isBuy
}: AmountInputProps) => {
  const [usdPercent, setUsdPercent] = useState(0)

  const { universe, clearingHouseState } = useHyperLiquid()

  const szDecimals = useMemo(() => {
    const assetIndex = getUniverseIndex(universe, selectedAsset)
    if (assetIndex === -1) return 0
    return universe[assetIndex].szDecimals || 0
  }, [universe, selectedAsset])

  const maxAllowedUsd = useMemo(() => {
    if (!clearingHouseState) return 0
    if (!isReduceOnly) return clearingHouseState.withdrawable
    const existingPosition = clearingHouseState.assetPositions.find((pos) => {
      return pos.position.coin === selectedAsset
    })
    if (!existingPosition) return clearingHouseState.withdrawable
    if (existingPosition.position.szi > 0 && isBuy) return 0
    if (existingPosition.position.szi < 0 && !isBuy) return 0
    const priceQuotient = parseFloat(limitPrice) / existingPosition.position.entryPx
    const maxAllowedUsd = existingPosition.position.positionValue * priceQuotient
    return Math.min(maxAllowedUsd, clearingHouseState.withdrawable)
  }, [isReduceOnly, clearingHouseState, selectedAsset, isBuy, limitPrice])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!clearingHouseState) return
    const input = e.target.value

    // Allow empty input or just a decimal point
    if (!input || input === '.') {
      setAssetAmount(input)
      setUsdAmount('')
      setUsdPercent(0)
      return
    }

    // Allow numeric input with at most one decimal point
    if (!/^-?\d*\.?\d*$/.test(input)) {
      return
    }

    // Check if input has more decimal places than allowed
    const parts = input.split('.')
    if (parts.length > 1 && parts[1].length > szDecimals) {
      return
    }

    setAssetAmount(input)
    const numValue = parseFloat(input)
    if (!isNaN(numValue)) {
      setUsdAmount((numValue * parseFloat(limitPrice)).toString())
      setUsdPercent(((numValue * parseFloat(limitPrice)) / maxAllowedUsd) * 100)
    }
  }

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!clearingHouseState) return
    const input = e.target.value

    // Allow empty input or just a decimal point
    if (!input || input === '.') {
      setUsdAmount(input)
      setAssetAmount('')
      setUsdPercent(0)
      return
    }

    // Only allow numeric input with at most one decimal point
    if (!/^[0-9]*\.?[0-9]*$/.test(input)) {
      return
    }

    setUsdAmount(input)
    if (parseFloat(limitPrice) > 0) {
      const newAmount = parseFloat(input) / parseFloat(limitPrice)
      const formattedAmount = newAmount.toFixed(szDecimals).replace(/\.?0+$/, '')
      setAssetAmount(formattedAmount)
    } else {
      setAssetAmount('')
    }
    setUsdPercent((parseFloat(input) / maxAllowedUsd) * 100)
  }

  const handleUsdPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!clearingHouseState) return
    const newUsdPercent = parseFloat(e.target.value) || 0
    setUsdPercent(newUsdPercent)
    const rawAmount = (newUsdPercent * maxAllowedUsd) / 100 / parseFloat(limitPrice)
    const roundedAmount = rawAmount.toFixed(szDecimals).replace(/\.?0+$/, '')
    setAssetAmount(roundedAmount)
    setUsdAmount(((newUsdPercent * maxAllowedUsd) / 100).toString())
  }

  return (
    <>
      <div className="px-4 border-b mb-1 border-[#FFFFFF0F]">
        <label className="block text-xs font-medium text-[#8B8BA0] mb-0.5">Amount</label>
        <div className="relative">
          <input
            type="text"
            placeholder="0.0000"
            value={assetAmount}
            onChange={handleAmountChange}
            className="w-full rounded-md p-1.5 focus:outline-none focus:none focus:none text-sm font-medium"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8B8BA0] text-xs">
            {getCoinName(selectedAsset)}
          </span>
        </div>
      </div>

      <div className="px-4 border-b mb-1 border-[#FFFFFF0F]">
        <label className="block text-xs font-medium text-[#8B8BA0] mb-0.5">Total</label>
        <div className="relative">
          <input
            type="text"
            placeholder="0.0000"
            value={usdAmount}
            onChange={handleTotalChange}
            className="w-full rounded-md p-1.5 focus:outline-none focus:none focus:none text-sm font-medium"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8B8BA0] text-xs">
            USD
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between w-full px-4 border-b mb-1 border-[#FFFFFF0F] pb-2">
        <div className="w-[70%]">
          <label className="block text-xs font-medium text-gray-400">
            Balance = {clearingHouseState?.withdrawable.toFixed(2)} USD
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={usdPercent}
            onChange={handleUsdPercentChange}
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
              background: `linear-gradient(to right, #5F46F9 0%, #5F46F9 ${usdPercent}%, #2A1B3D ${usdPercent}%, #2A1B3D 100%)`
            }}
          />
          <Image src={Slider1} alt="Slider1" width={20} height={20} className="w-full mt-0.5" />
          <div className="flex justify-between text-xs text-gray-500 mt-0.5">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="relative pl-4">
          <input
            type="string"
            className="w-16 h-8 rounded-md border border-white/10 bg-white/10 outline-none px-2 py-1 text-xs"
            value={usdPercent}
            onChange={handleUsdPercentChange}
          />
          <span className="absolute right-2 top-1.5 text-gray-500 text-xs">%</span>
        </div>
      </div>
    </>
  )
}

export default AmountInput
