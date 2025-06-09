import { MAX_DECIMALS_PERP } from '@/utils/constants'
import { MAX_DECIMALS_SPOT } from '@/utils/constants'
import useIsSpot from '@/hooks/useIsSpot'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import { getUniverseIndex, roundToSignificantFigures } from '@/utils/utils'
import { useMemo, useEffect, useState } from 'react'
import { MAX_SIG_FIGS } from '@/utils/constants'
import { IconRefresh } from '@tabler/icons-react'

interface ISetLastPriceProps {
  selectedAsset: string
  limitPrice: string
  setLimitPrice: (price: string) => void
  setUsdAmount: (amount: string) => void
  assetAmount: string
}

const SetPrice = ({
  selectedAsset,
  limitPrice,
  setLimitPrice,
  setUsdAmount,
  assetAmount
}: ISetLastPriceProps) => {
  const isSpot = useIsSpot()
  const { data: spotMeta } = useSpotMeta()
  const { data: universe } = usePerpsUniverse()
  const { allMids } = useHyperliquid()
  const [priceInitialized, setPriceInitialized] = useState(false)

  useEffect(() => {
    if (priceInitialized) setPriceInitialized(false)
  }, [selectedAsset])

  useEffect(() => {
    if (allMids[selectedAsset] && !limitPrice && !priceInitialized) {
      const formattedPrice = getFormattedPrice()
      setLimitPrice(formattedPrice)
      setPriceInitialized(true)
    }
  }, [allMids, selectedAsset])

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
      setLimitPrice(numValue.toString())
    } else {
      // For decimal values, format with proper decimal places
      setLimitPrice(numValue.toFixed(allowedDecimals).replace(/\.?0+$/, ''))
    }
  }

  const getFormattedPrice = () => {
    const maxDecimals = isSpot ? MAX_DECIMALS_SPOT : MAX_DECIMALS_PERP
    const allowedDecimals = maxDecimals - szDecimals
    const rawPrice = allMids[selectedAsset].toString()

    // Split into integer and decimal parts
    const [intPart, decPart] = rawPrice.split('.')

    // Count significant figures in integer part
    const intSigFigs = intPart.replace(/^0+/, '').length

    // If integer part has 5 or more significant figures, return just the integer part
    if (intSigFigs >= 5) {
      return intPart
    }

    // If no decimal part, return the integer as is
    if (!decPart) {
      return intPart
    }

    // For decimal numbers, check total significant figures
    const totalSigFigs = intSigFigs + decPart.length
    if (totalSigFigs > 5) {
      const truncateLength = 5 - intSigFigs
      if (truncateLength > 0) {
        return `${intPart}.${decPart.slice(0, truncateLength)}`
      }
      return intPart
    }

    // Handle decimal places restriction
    const maxAllowedDecimals = Math.min(allowedDecimals, decPart.length)
    return `${intPart}.${decPart.slice(0, maxAllowedDecimals)}`
  }

  return (
    <div className="flex w-full">
      <input
        type="text"
        placeholder="0"
        value={limitPrice}
        onChange={handleLimitPriceChange}
        onBlur={handleBlur}
        className="p-1.5 rounded-md focus:outline-none w-full font-medium text-sm text-right focus:none focus:none"
      />
      <button
        className="flex items-center gap-1 ml-auto font-medium text-[#7D67FF] text-xs align-middle cursor-pointer"
        onClick={() => setLimitPrice(getFormattedPrice())}
      >
        <IconRefresh style={{ width: 12, height: 'auto' }} className="w-3 h-3" />
        Last
      </button>
    </div>
  )
}

export default SetPrice
