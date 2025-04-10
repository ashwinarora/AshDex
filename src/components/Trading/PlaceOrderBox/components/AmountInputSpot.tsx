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

const isMatch = (a: string, b: string): boolean => {
  const baseA = a.split("-")[0];
  const baseB = b.split("-")[0];
  return baseA === baseB;
}

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
    if (isBuy) return spotState.balances.find((balance) => balance.coin === "USDC")?.total
    return spotState.balances.find((balance) => isMatch(balance.coin, selectedAsset))?.total
  }, [spotState, selectedAsset, isBuy])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!maxAllowed) return
    const newAmount = parseFloat(e.target.value) || 0
    setAmount(newAmount)
    setTotal(limitPrice * newAmount)
    setUsdPercent(((newAmount * limitPrice) / maxAllowed) * 100)
  }

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!maxAllowed) return
    const newTotal = parseFloat(e.target.value) || 0
    setTotal(newTotal)
    setAmount(limitPrice > 0 ? newTotal / limitPrice : 0)
    setUsdPercent((newTotal / maxAllowed) * 100)
  }

  const handleUsdPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!maxAllowed) return
    const newUsdPercent = parseFloat(e.target.value) || 0
    setUsdPercent(newUsdPercent)
    setAmount((newUsdPercent * maxAllowed) / 100 / limitPrice)
    setTotal((newUsdPercent * maxAllowed) / 100)
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
            onChange={handleAmountChange}
            className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
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
            onChange={handleTotalChange}
            className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 text-sm">
            USD
          </span>
        </div>
      </div>
      <div className="flex w-full px-4 border-b border-[#FFFFFF0F] pb-4">
        <div className="w-5/6">
          <label className="block text-sm font-medium text-gray-400">
            Balance = {maxAllowed?.toFixed(2)} {isBuy ? 'USDC' : getCoinName(selectedAsset)}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={usdPercent}
            onChange={handleUsdPercentChange}
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

export default AmountInputSpot
