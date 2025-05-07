'use client'

import { useHyperLiquid } from '@/context/HyperLiquid'
import { getCoinName } from '@/utils/utils'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import Slider1 from '@/assets/images/slider_value.svg'

interface AmountInputProps {
  selectedAsset: string
  assetAmount: number
  setAssetAmount: React.Dispatch<React.SetStateAction<number>>
  usdAmount: number
  setUsdAmount: React.Dispatch<React.SetStateAction<number>>
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
  const { clearingHouseState } = useHyperLiquid()
  const [usdPercent, setUsdPercent] = useState(0)

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
    const newAmount = parseFloat(e.target.value) || 0
    setAssetAmount(newAmount)
    setUsdAmount(parseFloat(limitPrice) * newAmount)
    setUsdPercent(((newAmount * parseFloat(limitPrice)) / maxAllowedUsd) * 100)
  }

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!clearingHouseState) return
    const newTotal = parseFloat(e.target.value) || 0
    setUsdAmount(newTotal)
    setAssetAmount(parseFloat(limitPrice) > 0 ? newTotal / parseFloat(limitPrice) : 0)
    setUsdPercent((newTotal / maxAllowedUsd) * 100)
  }

  const handleUsdPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!clearingHouseState) return
    const newUsdPercent = parseFloat(e.target.value) || 0
    setUsdPercent(newUsdPercent)
    setAssetAmount((newUsdPercent * maxAllowedUsd) / 100 / parseFloat(limitPrice))
    setUsdAmount((newUsdPercent * maxAllowedUsd) / 100)
  }

  return (
    <>
      <div className="px-4 border-b mb-3 border-[#FFFFFF0F]">
        <label className="block text-sm font-medium text-[#8B8BA0] mb-1">Amount</label>
        <div className="relative">
          <input
            type="text"
            placeholder="0.0000"
            value={assetAmount}
            onChange={handleAmountChange}
            className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8B8BA0] text-sm">
            {getCoinName(selectedAsset)}
          </span>
        </div>
      </div>

      <div className="px-4 border-b mb-3 border-[#FFFFFF0F]">
        <label className="block text-sm font-medium text-[#8B8BA0] mb-1">TOTAL</label>
        <div className="relative">
          <input
            type="text"
            placeholder="0.0000"
            value={usdAmount}
            onChange={handleTotalChange}
            className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8B8BA0] text-sm">
            USD
          </span>
        </div>
      </div>
      <div className="flex mb-3 items-end w-full px-4 border-b border-[#FFFFFF0F] pb-4">
        <div className="w-5/6">
          <label className="block text-sm font-medium text-gray-400">
            Balance = {clearingHouseState?.withdrawable.toFixed(2)} USD
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={usdPercent}
            onChange={handleUsdPercentChange}
            className="w-full cursor-pointer appearance-none h-2.5 rounded-lg outline-none
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:border-none
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:border-none"
            style={{
              background: `linear-gradient(to right, #5F46F9 0%, #5F46F9 ${usdPercent}%, #2A1B3D ${usdPercent}%, #2A1B3D 100%)`
            }}
          />
          <Image src={Slider1} alt="Slider1" width={20} height={20} className="w-full mt-1" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
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
            className="w-20 h-11 rounded-md border border-white/10 bg-white/10 outline-none px-4 py-2 flex justify-between"
            value={usdPercent}
            onChange={handleUsdPercentChange}
          />
          <span className="absolute right-2 top-2.5 text-gray-500">%</span>
        </div>
      </div>
    </>
  )
}

export default AmountInput
