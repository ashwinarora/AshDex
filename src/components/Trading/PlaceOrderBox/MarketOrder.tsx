'use client'
import { useMemo, useState } from 'react'
import BuyOrSell from './components/BuyOrSell'
import AmountInput from './components/AmountInput'
import LeverageMargin from './components/LeverageMargin'
import OrderButton from './components/OrderButton'
import CheckBox from '@/components/common/CheckBox'
import { IPlaceOrderProps } from '.'
import useIsSpot from '@/hooks/useIsSpot'
import AmountInputSpot from './components/AmountInputSpot'
import TPSL, { TPSLType } from './components/TPSL'
import MarginMode from './components/MarginMode'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { MAX_DECIMALS_PERP, MAX_DECIMALS_SPOT } from '@/utils/constants'
import { getUniverseIndex } from '@/utils/utils'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'

const MarketOrder = ({ selectedAsset }: IPlaceOrderProps) => {
  const { allMids } = useHyperliquid()
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [assetAmount, setAssetAmount] = useState<string>('')
  const [usdAmount, setUsdAmount] = useState<string>('')
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)
  const [isPostOnly, setIsPostOnly] = useState<boolean>(false)
  const [isReduceOnly, setIsReduceOnly] = useState<boolean>(false)
  const [tpsl, setTpsl] = useState<TPSLType>({
    isTpsl: false,
    takeProfit: 0,
    stopLoss: 0
  })
  const isSpot = useIsSpot()
  const { data: spotMeta } = useSpotMeta()
  const { data: universe } = usePerpsUniverse()

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
    const rawPrice = (allMids[selectedAsset] * (isBuy ? 1.1 : 0.9)).toString()

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

  console.log({ szDecimals })

  return (
    <div className="w-full h-full flex flex-col">
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-1">
          {isSpot ? (
            <AmountInputSpot
              selectedAsset={selectedAsset}
              assetAmount={assetAmount}
              setAssetAmount={setAssetAmount}
              usdAmount={usdAmount}
              setUsdAmount={setUsdAmount}
              limitPrice={allMids[selectedAsset].toString()}
              isBuy={isBuy}
            />
          ) : (
            <AmountInput
              selectedAsset={selectedAsset}
              assetAmount={assetAmount}
              setAssetAmount={setAssetAmount}
              usdAmount={usdAmount}
              setUsdAmount={setUsdAmount}
              limitPrice={allMids[selectedAsset]?.toString()}
              leverage={leverage}
              isReduceOnly={isReduceOnly}
              isBuy={isBuy}
            />
          )}
          {!isSpot && (
            <>
              <LeverageMargin
                selectedAsset={selectedAsset}
                leverage={leverage}
                setLeverage={setLeverage}
              />
              <MarginMode isCross={isCross} setIsCross={setIsCross} />
            </>
          )}
          <div className="grid grid-cols-1 gap-1 text-xs text-gray-400 border-b border-[#FFFFFF0F] pb-1 px-4">
            {!isSpot && (
              <>
                <CheckBox
                  label="Reduce Only"
                  setIsChecked={setIsReduceOnly}
                  isChecked={isReduceOnly}
                />
                <TPSL tpsl={tpsl} setTpsl={setTpsl} />
              </>
            )}
            <CheckBox label="Post-Only" setIsChecked={setIsPostOnly} isChecked={isPostOnly} />
          </div>
        </div>
      </div>
      <div className="p-2 border-t border-white/10">
        <OrderButton
          isBuy={isBuy}
          selectedAsset={selectedAsset}
          limitPrice={getFormattedPrice()}
          assetAmount={assetAmount}
          leverage={leverage}
          isCross={isCross}
          isPostOnly={isPostOnly}
          isReduceOnly={isReduceOnly}
        />
      </div>
    </div>
  )
}
export default MarketOrder
