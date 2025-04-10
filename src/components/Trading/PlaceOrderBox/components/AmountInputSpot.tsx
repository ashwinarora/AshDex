'use client'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { getCoinName } from '@/utils/utils'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import Slider1 from '@/assets/images/slider_value.svg'

interface AmountInputSpotProps {
  selectedAsset: string
  amount: number
  setAmount: React.Dispatch<React.SetStateAction<number>>
  total: number
  setTotal: React.Dispatch<React.SetStateAction<number>>
  limitPrice: number
  isBuy: boolean
}

const isMatch = (a: string, b: string): boolean => a.split('-')[0] === b.split('-')[0]

const AmountInputSpot = ({
  selectedAsset,
  amount,
  setAmount,
  total,
  setTotal,
  limitPrice,
  isBuy
}: AmountInputSpotProps) => {
  const { spotState } = useHyperLiquid()
  const [usdPercent, setUsdPercent] = useState(0)

  const maxAllowed = useMemo(() => {
    if (!spotState) return 0
    return isBuy
      ? (spotState.balances.find((b) => b.coin === 'USDC')?.total ?? 0)
      : (spotState.balances.find((b) => isMatch(b.coin, selectedAsset))?.total ?? 0)
  }, [spotState, selectedAsset, isBuy])

  const updateFromAmount = (newAmount: number) => {
    setAmount(newAmount)
    const newTotal = newAmount * limitPrice
    setTotal(newTotal)
    setUsdPercent(((isBuy ? newTotal : newAmount) / maxAllowed) * 100)
  }

  const updateFromTotal = (newTotal: number) => {
    setTotal(newTotal)
    const newAmount = limitPrice > 0 ? newTotal / limitPrice : 0
    setAmount(newAmount)
    setUsdPercent(((isBuy ? newTotal : newAmount) / maxAllowed) * 100)
  }

  const updateFromPercent = (percent: number) => {
    setUsdPercent(percent)
    if (isBuy) {
      const newTotal = (percent / 100) * maxAllowed
      setTotal(newTotal)
      setAmount(limitPrice > 0 ? newTotal / limitPrice : 0)
    } else {
      const newAmount = (percent / 100) * maxAllowed
      setAmount(newAmount)
      setTotal(newAmount * limitPrice)
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
            value={amount}
            onChange={(e) => updateFromAmount(parseFloat(e.target.value) || 0)}
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
            value={total}
            onChange={(e) => updateFromTotal(parseFloat(e.target.value) || 0)}
            className="w-full rounded-md p-2 focus:outline-none text-xl font-medium"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 text-sm">
            USD
          </span>
        </div>
      </div>

      <div className="flex w-full px-4 border-b border-[#FFFFFF0F] pb-4">
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
          <Image src={Slider1} alt="" width={20} height={20} className="w-full mt-1" />
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
