import React, { useMemo } from 'react'
import Image from 'next/image'
import bitcoinicon from '@/assets/images/bitcoin_logo.svg'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { getUniverseIndex } from '@/utils/utils'

interface AssetItemProps {
  assetKey: string
  value: string | number
  selectedAsset: string | null
  setSelectedAsset: (assetKey: string) => void
}

const AssetItem: React.FC<AssetItemProps> = ({
  assetKey,
  value,
  selectedAsset,
  setSelectedAsset
}) => {
  const { universe } = useHyperLiquid()
  const maxLeverage = useMemo(() => {
    if (!universe) return 1
    const assetIndex = getUniverseIndex(universe, assetKey || '')
    return universe?.[assetIndex]?.maxLeverage || 1
  }, [universe, assetKey])
  return (
    <div
      key={assetKey}
      onClick={() => setSelectedAsset(assetKey)}
      className={`flex px-4 py-3 text-white cursor-pointer m-2 bg-[#FFFFFF0F] rounded-md text-base font-medium`}
    >
      <label className="flex min-w-56 items-center space-x-2 cursor-pointer pr-3">
        <input
          type="radio"
          name="option"
          value={assetKey}
          className="peer hidden"
          checked={selectedAsset === assetKey}
        />

        <div
          className={`min-w-6 min-h-6 border-2 rounded-full ${
            selectedAsset === assetKey
              ? 'border-[#5F46F9] flex items-center justify-center'
              : 'bg-[#0F081680] border-[#FFFFFF29]'
          }`}
        >
          {selectedAsset === assetKey && (
            <div className="min-w-2 min-h-2 bg-[#5F46F9] rounded-full"></div>
          )}
        </div>

        <Image src={bitcoinicon} alt="Bitcoin" className="w-6 h-6 cursor-pointer mx-1" />

        <span className="text-wrap mx-1 w-28">{assetKey}</span>

        <span className="mx-1">{maxLeverage}×</span>
      </label>

      <div className="px-1 w-28">${value}</div>
      <div className="px-2 w-28">-/-</div>
      <div className="px-2 w-28">-/-</div>
      <div className="px-2 w-28">-/-</div>
    </div>
  )
}

export default AssetItem
