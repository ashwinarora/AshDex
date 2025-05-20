import Image from 'next/image'
import refreshpurpleIcon from '@/assets/images/refreshpurple2_icon.svg'
import { MAX_DECIMALS_PERP } from '@/utils/constants'
import { MAX_DECIMALS_SPOT } from '@/utils/constants'
import useIsSpot from '@/hooks/useIsSpot'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import { getUniverseIndex } from '@/utils/utils'
import { useMemo } from 'react'

interface ISetLastPriceProps {
  selectedAsset: string
  setPrice: (price: string) => void
}

const SetLastPrice = ({ selectedAsset, setPrice }: ISetLastPriceProps) => {
  const isSpot = useIsSpot()
  const { data: spotMeta } = useSpotMeta()
  const { data: universe } = usePerpsUniverse()
  const { allMids } = useHyperliquid()

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
    <button
      className="absolute inline-flex right-2 top-1/2 cursor-pointer text-xs items-center gap-x-1 -translate-y-1/2 text-[#7D67FF] font-medium"
      onClick={() => setPrice(getFormattedPrice())}
    >
      <Image
        src={refreshpurpleIcon}
        style={{ width: 12, height: 'auto' }}
        alt="Refresh Icon"
        className="w-3 h-3"
      />
      Last
    </button>
  )
}

export default SetLastPrice
