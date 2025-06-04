'use client'
import { useMemo, useState, useEffect } from 'react'
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
import SlippageModal from './components/SlippageModal'

const MarketOrder = ({ selectedAsset }: IPlaceOrderProps) => {
  const { allMids } = useHyperliquid()
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [assetAmount, setAssetAmount] = useState<string>('')
  const [usdAmount, setUsdAmount] = useState<string>('')
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)
  const [isReduceOnly, setIsReduceOnly] = useState<boolean>(false)
  const [slippage, setSlippage] = useState<number>(1) // Default 1% slippage
  const [isSlippageModalOpen, setIsSlippageModalOpen] = useState<boolean>(false)
  const [tpsl, setTpsl] = useState<TPSLType>({
    isTpsl: false,
    takeProfit: 0,
    stopLoss: 0
  })
  const isSpot = useIsSpot()
  const { data: spotMeta } = useSpotMeta()
  const { data: universe } = usePerpsUniverse()
  const [isInvalid, setIsInvalid] = useState<boolean>(false)

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
    let rawPrice: string
    if (isSpot) {
      const slippageMultiplier = isBuy ? 1 + slippage / 100 : 1 - slippage / 100
      rawPrice = (allMids[selectedAsset] * slippageMultiplier).toString()
    } else {
      rawPrice = (allMids[selectedAsset] * (isBuy ? 1.1 : 0.9)).toString()
    }

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

  useEffect(() => {
    const formattedLimitPrice = getFormattedPrice().replace(/\.?0+$/, '')
    const formattedAssetAmount = assetAmount.replace(/\.?0+$/, '')

    // Check if TPSL is enabled and both values are empty/zero
    const isTpslInvalid =
      tpsl.isTpsl && Number(tpsl.takeProfit) === 0 && Number(tpsl.stopLoss) === 0

    if (
      formattedLimitPrice === '0' ||
      formattedLimitPrice === '' ||
      formattedAssetAmount === '0' ||
      formattedAssetAmount === '' ||
      isTpslInvalid ||
      Number(usdAmount) < 10
    ) {
      setIsInvalid(true)
    } else {
      setIsInvalid(false)
    }
  }, [getFormattedPrice(), assetAmount, tpsl])

  const calculateLiquidationPrice = () => {
    if (
      !getFormattedPrice() ||
      !assetAmount ||
      Number(getFormattedPrice()) === 0 ||
      Number(assetAmount) === 0
    ) {
      return 0
    }

    const entryPrice = Number(getFormattedPrice())
    const positionSize = Number(assetAmount)
    const leverageUsed = leverage
    const orderValue = entryPrice * positionSize

    // Initial margin required
    const initialMargin = orderValue / leverageUsed

    // Maintenance margin is half of initial margin
    const maintenanceMargin = initialMargin / 2

    // Margin available = Account value - maintenance margin (assuming full balance used)
    const accountValue = initialMargin // Cross margin assumption: full margin used
    const marginAvailable = accountValue - maintenanceMargin

    const side = isBuy ? 1 : -1
    const l = 1 / 40 // MAINTENANCE_LEVERAGE is 40 for 40x max leverage asset

    const denom = positionSize * (1 - l * side)

    if (denom === 0) return 0

    const liqPrice = entryPrice - side * (marginAvailable / denom)
    if (Number(usdAmount) < 10) {
      return 'N/A'
    }
    return Number(liqPrice).toFixed(2)
  }

  return (
    <div className="flex flex-col w-full h-full">
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-2">
          {!isSpot && (
            <>
              {' '}
              <MarginMode isCross={isCross} setIsCross={setIsCross} />
              <LeverageMargin
                selectedAsset={selectedAsset}
                leverage={leverage}
                setLeverage={setLeverage}
              />
            </>
          )}
          <hr className="border-white/10" />

          {isSpot ? (
            <AmountInputSpot
              selectedAsset={selectedAsset}
              assetAmount={assetAmount}
              setAssetAmount={setAssetAmount}
              usdAmount={usdAmount}
              setUsdAmount={setUsdAmount}
              limitPrice={allMids[selectedAsset]?.toString() || '0'}
              isBuy={isBuy}
            />
          ) : (
            <AmountInput
              selectedAsset={selectedAsset}
              assetAmount={assetAmount}
              setAssetAmount={setAssetAmount}
              usdAmount={usdAmount}
              setUsdAmount={setUsdAmount}
              limitPrice={allMids[selectedAsset]?.toString() || '0'}
              leverage={leverage}
              isReduceOnly={isReduceOnly}
              isBuy={isBuy}
            />
          )}

          <div className="mx-3 text-xs">
            <CheckBox label="Reduce Only" setIsChecked={setIsReduceOnly} isChecked={isReduceOnly} />
          </div>
          <hr className="border-white/10" />

          <div className="gap-2 grid grid-cols-1 px-3 text-gray-400 text-xs">
            {!isSpot && (
              <>
                <TPSL
                  limitPrice={getFormattedPrice()}
                  isBuy={isBuy}
                  leverage={leverage}
                  tpsl={tpsl}
                  setTpsl={setTpsl}
                />
              </>
            )}
          </div>
        </div>
      </div>
      <div className="p-2 border-white/10 border-t">
        {isSpot && (
          <button
            onClick={() => setIsSlippageModalOpen(true)}
            className="flex items-center gap-2 mb-2 px-2 text-gray-400 hover:text-white text-xs transition-colors cursor-pointer"
          >
            <span>Slippage</span>
            <span className="text-white">{slippage}%</span>
          </button>
        )}
        <OrderButton
          isBuy={isBuy}
          selectedAsset={selectedAsset}
          limitPrice={getFormattedPrice()}
          assetAmount={assetAmount}
          leverage={leverage}
          isCross={isCross}
          isPostOnly={false}
          isReduceOnly={isReduceOnly}
          isInvalid={isInvalid}
        />
      </div>
      <div className="flex flex-col p-3 text-sm">
        <div className="flex justify-between">
          <p className="text-white/50">Liquidation Price</p>
          <p className="text-white"> {calculateLiquidationPrice()}</p>
        </div>

        <div className="flex justify-between">
          <p className="text-white/50">Order Value</p>
          <p className="text-white">${Number(usdAmount).toFixed(2)} </p>
        </div>
        <div className="flex justify-between">
          <p className="text-white/50">Fees</p>
          <p className="text-white">0.0% / 0.0%</p>
        </div>
      </div>
      <SlippageModal
        isOpen={isSlippageModalOpen}
        onClose={() => setIsSlippageModalOpen(false)}
        slippage={slippage}
        setSlippage={setSlippage}
      />
    </div>
  )
}
export default MarketOrder
