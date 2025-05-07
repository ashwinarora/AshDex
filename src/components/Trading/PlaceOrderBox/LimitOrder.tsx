'use client'
import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import BuyOrSell from './components/BuyOrSell'
import AmountInput from './components/AmountInput'
import LeverageMargin from './components/LeverageMargin'
import OrderButton from './components/OrderButton'
import CheckBox from '@/components/common/CheckBox'
import TPSL, { TPSLType } from './components/TPSL'
import { IPlaceOrderProps } from '.'
import useIsSpot from '@/hooks/useIsSpot'
import AmountInputSpot from './components/AmountInputSpot'
import refreshpurpleIcon from '@/assets/images/refreshpurple2_icon.svg'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { getUniverseIndex, roundToSignificantFigures } from '@/utils/utils'
import { MAX_DECIMALS_PERP, MAX_DECIMALS_SPOT, MAX_SIG_FIGS } from '@/utils/constants'

const LimitOrder = ({ selectedAsset }: IPlaceOrderProps) => {
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [limitPrice, setLimitPrice] = useState<string>('')
  const [assetAmount, setAssetAmount] = useState<string>('')
  const [usdAmount, setUsdAmount] = useState<string>('')
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)
  const [isPostOnly, setIsPostOnly] = useState<boolean>(false)
  const [isReduceOnly, setIsReduceOnly] = useState<boolean>(false)
  const isSpot = useIsSpot()
  const [tpsl, setTpsl] = useState<TPSLType>({
    isTpsl: false,
    takeProfit: 0,
    stopLoss: 0
  })
  const { universe, spotMeta } = useHyperLiquid()

  const szDecimals = useMemo(() => {
    if (isSpot) {
      const tokenData = spotMeta.tokens.find((token) => token.name.includes(selectedAsset))
      return tokenData?.szDecimals || 0
    } else {
      const assetIndex = getUniverseIndex(universe, selectedAsset)
      if (assetIndex === -1) return 0
      return universe[assetIndex].szDecimals || 0
    }
  }, [universe, selectedAsset, isSpot, spotMeta])

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value

    // Allow empty input or just a decimal point
    if (!input || input === '.') {
      setLimitPrice(input)
      setUsdAmount('0')
      return
    }

    // Only allow numeric input with at most one decimal point
    if (!/^[0-9]*\.?[0-9]*$/.test(input)) {
      return
    }

    const maxDecimals = isSpot ? MAX_DECIMALS_SPOT : MAX_DECIMALS_PERP
    const allowedDecimals = maxDecimals - szDecimals

    // Check if input has more decimal places than allowed
    const parts = input.split('.')
    if (parts.length > 1 && parts[1].length > allowedDecimals) {
      return
    }

    // Integer values are always allowed
    if (!input.includes('.')) {
      setLimitPrice(input)
      const numValue = parseFloat(input)
      setUsdAmount((numValue * parseFloat(assetAmount)).toString())
      return
    }

    // For non-integer values, enforce 5 significant digits
    const numValue = parseFloat(input)
    if (!isNaN(numValue)) {
      // Check if input exceeds 5 significant figures
      const sigFigsFormatted = roundToSignificantFigures(numValue, MAX_SIG_FIGS)

      // If the input exceeds 5 significant figures, don't update
      if (sigFigsFormatted.toString() !== numValue.toString()) {
        return
      }

      // Update price
      setLimitPrice(input)
      setUsdAmount((numValue * parseFloat(assetAmount)).toString())
    }
  }

  const handleBlur = () => {
    // When user leaves the field, format the price properly
    if (!limitPrice || limitPrice === '.') {
      setLimitPrice('')
      return
    }

    const numValue = parseFloat(limitPrice)
    const maxDecimals = isSpot ? MAX_DECIMALS_SPOT : MAX_DECIMALS_PERP
    const allowedDecimals = maxDecimals - szDecimals

    // For integer values, keep them as is
    if (Number.isInteger(numValue)) {
      setLimitPrice(numValue.toString().replace(/\.?0+$/, ''))
    } else {
      // For decimal values, format with proper decimal places
      setLimitPrice(numValue.toFixed(allowedDecimals).replace(/\.?0+$/, ''))
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="border-b border-white/10">
        <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          <div className="px-4 border-b border-[#FFFFFF0F] mb-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Limit price</label>
            <div className="relative">
              <input
                type="text"
                placeholder="0"
                value={limitPrice}
                onChange={handleLimitPriceChange}
                onBlur={handleBlur}
                className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
              />
              <span className="absolute right-2 top-1/2 flex text-sm items-center gap-x-1.5 -translate-y-1/2 text-[#7D67FF] font-medium">
                <Image
                  src={refreshpurpleIcon}
                  style={{ width: 15, height: 'auto' }}
                  alt="Refresh Icon"
                  className="w-3.5 h-3.5"
                />
                Last
              </span>
            </div>
          </div>
          {isSpot ? (
            <AmountInputSpot
              selectedAsset={selectedAsset}
              assetAmount={assetAmount}
              setAssetAmount={setAssetAmount}
              usdAmount={usdAmount}
              setUsdAmount={setUsdAmount}
              limitPrice={limitPrice}
              isBuy={isBuy}
            />
          ) : (
            <AmountInput
              selectedAsset={selectedAsset}
              assetAmount={assetAmount}
              setAssetAmount={setAssetAmount}
              usdAmount={usdAmount}
              setUsdAmount={setUsdAmount}
              limitPrice={limitPrice}
              isReduceOnly={isReduceOnly}
              isBuy={isBuy}
            />
          )}
          {!isSpot && (
            <LeverageMargin
              selectedAsset={selectedAsset}
              leverage={leverage}
              setLeverage={setLeverage}
              isCross={isCross}
              setIsCross={setIsCross}
            />
          )}
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 border-b border-[#FFFFFF0F] pb-2 px-4">
            {!isSpot && (
              <>
                <TPSL tpsl={tpsl} setTpsl={setTpsl} />
                <CheckBox
                  label="Reduce Only"
                  setIsChecked={setIsReduceOnly}
                  isChecked={isReduceOnly}
                />
              </>
            )}
            <CheckBox label="Post-Only" setIsChecked={setIsPostOnly} isChecked={isPostOnly} />
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-white/10">
        <OrderButton
          isBuy={isBuy}
          selectedAsset={selectedAsset}
          limitPrice={limitPrice}
          assetAmount={assetAmount}
          leverage={leverage}
          isCross={isCross}
          isPostOnly={isPostOnly}
          isReduceOnly={isReduceOnly}
          tpsl={tpsl}
        />
      </div>
    </div>
  )
}
export default LimitOrder
