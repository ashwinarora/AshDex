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
import { getUniverseIndex, calculateLiquidationPrice } from '@/utils/utils'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import SlippageModal from './components/SlippageModal'

const MarketOrder = ({ selectedAsset }: IPlaceOrderProps) => {
  const { allMids, clearingHouseState } = useHyperliquid()
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
  const [crossAccountValue, setCrossAccountValue] = useState(0)

  useEffect(() => {
    setCrossAccountValue(clearingHouseState?.marginSummary?.accountValue || 0)
  }, [clearingHouseState])

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

    const slippageMultiplier = isBuy ? 1 + slippage / 100 : 1 - slippage / 100
    const rawPrice = (allMids[selectedAsset] * slippageMultiplier).toString()

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

  const liquidationPrice = useMemo(() => {
    if (
      !getFormattedPrice() ||
      !assetAmount ||
      Number(getFormattedPrice()) === 0 ||
      Number(assetAmount) === 0
    ) {
      return 0
    }

    const assetIndex = getUniverseIndex(universe, selectedAsset)
    const maxLeverage = universe[assetIndex]?.maxLeverage || 1

    return calculateLiquidationPrice({
      entryPrice: Number(getFormattedPrice()),
      positionSize: Number(assetAmount),
      leverage,
      isBuy,
      usdAmount: Number(usdAmount),
      isCross,
      maxLeverage,
      crossAccountValue
    })
  }, [
    getFormattedPrice,
    assetAmount,
    leverage,
    isBuy,
    usdAmount,
    isCross,
    universe,
    selectedAsset,
    crossAccountValue
  ])

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
        <div className="p-2 border-white/10 border-t">
        <OrderButton
          isBuy={isBuy}
          selectedAsset={selectedAsset}
          limitPrice={getFormattedPrice()}
          assetAmount={assetAmount}
          leverage={leverage}
          isCross={isCross}
          isPostOnly={false}
          isReduceOnly={isReduceOnly}
          tpsl={tpsl}
          usdAmount={usdAmount}
          isSpot={isSpot}
        />
      </div>
      <div className="flex flex-col px-3 pb-2 text-sm">
        <div className="flex justify-between">
          <p className="text-white/50">Liquidation Price</p>
          <p className="text-white">{liquidationPrice}</p>
        </div>

        <div className="flex justify-between">
          <p className="text-white/50">Order Value</p>
          <p className="text-white">${Number(usdAmount).toFixed(2)} </p>
        </div>
        <div className="flex justify-between">
          <p className="text-white/50">Margin Required</p>
          <p className="text-white">
            ${((Number(assetAmount) * Number(allMids[selectedAsset])) / leverage).toFixed(2)}
          </p>
        </div>
        {
          <div className="flex justify-between">
            <p className="text-white/50">Slippage</p>
            <p
              onClick={() => setIsSlippageModalOpen(true)}
              className="bg-primary/50 px-2 rounded-md text-white cursor-pointer"
            >
              Max. {slippage}%
            </p>
          </div>
        }
        <div className="flex justify-between">
          <p className="text-white/50">Fees</p>
          <p className="text-white">0.0% / 0.0%</p>
        </div>
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
