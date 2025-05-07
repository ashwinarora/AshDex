'use client'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { getCoinName } from '@/utils/utils'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import Slider1 from '@/assets/images/slider_value.svg'

interface AmountInputSpotProps {
  selectedAsset: string
  assetAmount: string
  setAssetAmount: React.Dispatch<React.SetStateAction<string>>
  usdAmount: string
  setUsdAmount: React.Dispatch<React.SetStateAction<string>>
  limitPrice: string
  isBuy: boolean
}

const isMatch = (a: string, b: string): boolean => a.split('-')[0] === b.split('-')[0]

const AmountInputSpot = ({
  selectedAsset,
  assetAmount,
  setAssetAmount,
  usdAmount,
  setUsdAmount,
  limitPrice,
  isBuy
}: AmountInputSpotProps) => {
  const { spotState, spotMeta } = useHyperLiquid()
  const [usdPercent, setUsdPercent] = useState(0)

  const szDecimals = useMemo(() => {
    const tokenData = spotMeta.tokens.find((token) => token.name.includes(selectedAsset))
    return tokenData?.szDecimals || 0
  }, [selectedAsset, spotMeta])

  const maxAllowed = useMemo(() => {
    if (!spotState) return 0
    return isBuy
      ? (spotState.balances.find((b) => b.coin === 'USDC')?.total ?? 0)
      : (spotState.balances.find((b) => isMatch(b.coin, selectedAsset))?.total ?? 0)
  }, [spotState, selectedAsset, isBuy])

  const updateFromAssetAmount = (input: string) => {
    // Allow empty input or just a decimal point
    if (!input || input === '.') {
      setAssetAmount(input)
      setUsdAmount('')
      setUsdPercent(0)
      return
    }

    // Only allow numeric input with at most one decimal point
    if (!/^[0-9]*\.?[0-9]*$/.test(input)) {
      return
    }

    // Check if input has more decimal places than allowed
    const parts = input.split('.')
    if (parts.length > 1 && parts[1].length > szDecimals) {
      return
    }

    // For non-decimal values, keep as is
    if (!input.includes('.')) {
      setAssetAmount(input)
      const numValue = parseFloat(input)
      const newTotal = numValue * parseFloat(limitPrice)
      setUsdAmount(newTotal.toString())
      setUsdPercent(((isBuy ? newTotal : numValue) / maxAllowed) * 100)
      return
    }

    // For decimal values, format with proper decimal places and remove trailing zeros
    const numValue = parseFloat(input)
    if (!isNaN(numValue)) {
      const formattedValue = numValue.toFixed(szDecimals).replace(/\.?0+$/, '')
      setAssetAmount(formattedValue)
      const newTotal = numValue * parseFloat(limitPrice)
      setUsdAmount(newTotal.toString())
      setUsdPercent(((isBuy ? newTotal : numValue) / maxAllowed) * 100)
    }
  }

  const updateFromUsdAmount = (input: string) => {
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
      setUsdPercent(((isBuy ? parseFloat(input) : newAmount) / maxAllowed) * 100)
    } else {
      setAssetAmount('')
      setUsdPercent(0)
    }
  }

  const updateFromPercent = (percent: number) => {
    setUsdPercent(percent)
    if (isBuy) {
      const newTotal = (percent / 100) * maxAllowed
      setUsdAmount(newTotal.toString())
      if (parseFloat(limitPrice) > 0) {
        const newAmount = newTotal / parseFloat(limitPrice)
        const formattedAmount = newAmount.toFixed(szDecimals).replace(/\.?0+$/, '')
        setAssetAmount(formattedAmount)
      } else {
        setAssetAmount('')
      }
    } else {
      const newAmount = (percent / 100) * maxAllowed
      const formattedAmount = newAmount.toFixed(szDecimals).replace(/\.?0+$/, '')
      setAssetAmount(formattedAmount)
      setUsdAmount((newAmount * parseFloat(limitPrice)).toString())
    }
  }

  return (
    <>
      <div className="px-4 border-b border-[#FFFFFF0F]">
        <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
        <div className="relative">
          <input
            type="text"
            placeholder="0.0000"
            value={assetAmount}
            onChange={(e) => updateFromAssetAmount(e.target.value)}
            className="w-full rounded-md p-2 focus:outline-none text-xl font-medium"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 text-sm">
            {getCoinName(selectedAsset)}
          </span>
        </div>
      </div>

      <div className="px-4 border-b border-[#FFFFFF0F]">
        <label className="block text-sm font-medium text-gray-300 mb-1">TOTAL</label>
        <div className="relative">
          <input
            type="text"
            placeholder="0.0000"
            value={usdAmount}
            onChange={(e) => updateFromUsdAmount(e.target.value)}
            className="w-full rounded-md p-2 focus:outline-none text-xl font-medium"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 text-sm">
            USD
          </span>
        </div>
      </div>

      <div className="flex w-full items-end px-4 border-b border-[#FFFFFF0F] pb-4">
        <div className="w-5/6">
          <label className="block text-sm font-medium text-gray-400">
            Balance = {maxAllowed.toFixed(2)} {isBuy ? 'USDC' : getCoinName(selectedAsset)}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={usdPercent}
            onChange={(e) => updateFromPercent(parseFloat(e.target.value) || 0)}
            className="w-full cursor-pointer appearance-none h-2.5 rounded-lg outline-none"
            style={{
              background: `linear-gradient(to right, #702DF5 0%, #702DF5 ${usdPercent}%, #2A1B3D ${usdPercent}%, #2A1B3D 100%)`
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
            type="text"
            className="w-20 h-11 rounded-md border border-white/10 bg-white/10 outline-none px-4 py-2"
            value={usdPercent}
            onChange={(e) => updateFromPercent(parseFloat(e.target.value) || 0)}
          />
          <span className="absolute right-2 top-2.5 text-gray-500">%</span>
        </div>
      </div>
    </>
  )
}

export default AmountInputSpot
