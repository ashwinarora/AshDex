'use client'

import { getCoinName, getUniverseIndex } from '@/utils/utils'
import { useEffect, useMemo, useState } from 'react'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { IconPercentage } from '@tabler/icons-react'

interface AmountInputProps {
  selectedAsset: string
  assetAmount: string
  setAssetAmount: React.Dispatch<React.SetStateAction<string>>
  usdAmount: string
  setUsdAmount: React.Dispatch<React.SetStateAction<string>>
  limitPrice: string
  leverage: number
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
  leverage,
  isReduceOnly,
  isBuy
}: AmountInputProps) => {
  const [usdPercent, setUsdPercent] = useState(0)
  const [isInputUsd, setIsInputUsd] = useState(false)

  const { data: universe } = usePerpsUniverse()
  const { clearingHouseState } = useHyperliquid()

  const szDecimals = useMemo(() => {
    const assetIndex = getUniverseIndex(universe, selectedAsset)
    if (assetIndex === -1) return 0
    return universe[assetIndex].szDecimals || 0
  }, [universe, selectedAsset])

  const maxAllowedUsd = useMemo(() => {
    if (!clearingHouseState) return 0
    if (!isReduceOnly) return clearingHouseState.withdrawable * leverage
    const existingPosition = clearingHouseState.assetPositions.find((pos) => {
      return pos.position.coin === selectedAsset
    })
    if (!existingPosition) return 0
    if (existingPosition.position.szi > 0 && isBuy) return 0
    if (existingPosition.position.szi < 0 && !isBuy) return 0
    const priceQuotient = parseFloat(limitPrice) / existingPosition.position.entryPx
    const maxAllowedUsd = existingPosition.position.positionValue * priceQuotient
    return maxAllowedUsd
  }, [isReduceOnly, clearingHouseState, selectedAsset, isBuy, limitPrice, leverage])

  useEffect(() => {
    if (!clearingHouseState) return
    if (usdAmount === '') return
    setUsdPercent((parseFloat(usdAmount) / maxAllowedUsd) * 100)
  }, [clearingHouseState, usdAmount, maxAllowedUsd])

  const handleAssetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!/^[0-9]*\.?[0-9]*$/.test(input)) {
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

  const handleUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="flex flex-col gap-2 mx-3">
      <label className="block font-medium text-gray-400 text-xs">
        Max ={' '}
        {isInputUsd
          ? `${maxAllowedUsd.toFixed(2)} USD`
          : `${(maxAllowedUsd / parseFloat(limitPrice)).toFixed(szDecimals)} ${getCoinName(selectedAsset)}`}
      </label>
      <div className="flex items-center px-3 border border-white/10 rounded-md align-middle">
        <p className="font-medium text-white/50 text-xs whitespace-nowrap">Position Size</p>
        <div className="relative flex items-center w-full">
          <input
            type="text"
            placeholder="0.0000"
            value={
              isInputUsd ? Number(usdAmount).toFixed(2) : Number(assetAmount).toFixed(szDecimals)
            }
            onChange={isInputUsd ? handleUSDChange : handleAssetChange}
            className="p-1.5 rounded-md focus:outline-none w-full font-medium text-sm text-right focus:none focus:none"
          />
          <select
            value={isInputUsd ? 'usd' : 'asset'}
            onChange={(e) => setIsInputUsd(e.target.value === 'usd')}
            className="bg-transparent border-none focus:outline-none text-[#8B8BA0] text-xs cursor-pointer"
          >
            <option value="asset">{getCoinName(selectedAsset)}</option>
            <option value="usd">USD</option>
          </select>
        </div>
      </div>
      <div className="flex justify-between items-end pb-1 w-full">
        <div className="pr-3 w-full">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Number(usdPercent) || 0}
            onChange={(e) => handleUsdPercentChange(e)}
            className="[&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-webkit-slider-thumb]:border-none rounded-lg [&::-moz-range-thumb]:rounded-full [&::-webkit-slider-thumb]:rounded-full outline-none w-full [&::-moz-range-thumb]:w-3 [&::-webkit-slider-thumb]:w-3 h-0.5 [&::-moz-range-thumb]:h-3 [&::-webkit-slider-thumb]:h-3 appearance-none [&::-moz-range-thumb]:appearance-none [&::-webkit-slider-thumb]:appearance-none cursor-pointer [&::-moz-range-thumb]:cursor-pointer [&::-webkit-slider-thumb]:cursor-pointer"
            style={{
              background: `linear-gradient(to right, #5F46F9 0%, #5F46F9 ${Number(usdPercent)}%, #2A1B3D ${Number(usdPercent)}%, #2A1B3D 100%)`
            }}
          />
          <div className="flex justify-between mt-0.5 text-gray-500 text-xs">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
        <div className="flex items-center border border-white/10 rounded-md">
          <input
            type="number"
            max={100}
            min={0}
            maxLength={3}
            minLength={1}
            readOnly={true}
            className="px-2 py-1 outline-none w-10 h-8 text-xs text-right"
            value={Number(usdPercent) || 0}
          />
          <IconPercentage className="mr-2 w-4 h-4" />
        </div>
      </div>
    </div>
  )
}

export default AmountInput
