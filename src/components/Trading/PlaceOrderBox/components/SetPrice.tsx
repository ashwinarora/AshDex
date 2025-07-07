import { MAX_DECIMALS_PERP } from '@/utils/constants'
import { MAX_DECIMALS_SPOT } from '@/utils/constants'
import useIsSpot from '@/hooks/useIsSpot'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { useSpotMeta } from '@/hooks/useSpotMeta'

import { getPerpsUniverseIndex, roundToSignificantFigures } from '@/utils/utils'
import { useMemo, useEffect, useState } from 'react'
import { MAX_SIG_FIGS } from '@/utils/constants'
import { IconRefresh } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ISetLastPriceProps {
  selectedAsset: string
  limitPrice: string
  setLimitPrice: (price: string) => void
  setUsdAmount: (amount: string) => void
  assetAmount: string
  disabled?: boolean
}

const SetPrice = ({
  selectedAsset,
  limitPrice,
  setLimitPrice,
  setUsdAmount,
  assetAmount,
  disabled = false
}: ISetLastPriceProps) => {
  const isSpot = useIsSpot()
  const { data: spotMeta } = useSpotMeta()
  const { allMids, perpsMeta } = useHyperliquidStore(
    useShallow((state) => ({
      allMids: state.allMids,
      perpsMeta: state.perpsMeta
    }))
  )
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
      const tokenData = spotMeta?.tokens.find((token) => token.name.includes(selectedAsset))
      return tokenData?.szDecimals || 0
    } else {
      const assetIndex = getPerpsUniverseIndex(perpsMeta?.universe || [], selectedAsset)
      if (assetIndex === -1) return 0
      return perpsMeta?.universe[assetIndex].szDecimals || 0
    }
  }, [perpsMeta, selectedAsset, isSpot, spotMeta])

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
    <div className="flex w-full gap-2 items-center">
      <Input
        type="text"
        placeholder="0"
        value={limitPrice}
        onChange={handleLimitPriceChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={cn('w-full text-right text-white shrink-0')}
      />
      <Button
        variant="outline"
        size={'sm'}
        className="text-xs"
        disabled={disabled}
        // className="flex items-center gap-1 ml-auto font-medium text-xs align-middle cursor-pointer"
        onClick={() => setLimitPrice(getFormattedPrice())}
      >
        <IconRefresh className="size-3" />
        Last
      </Button>
      {/* */}
    </div>
  )
}

export default SetPrice
