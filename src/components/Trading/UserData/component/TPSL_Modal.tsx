import React, { useMemo, useState } from 'react'
import { IPositionData } from '@/utils/hyperliquid/hyperLiquidTypes'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import { OrderData, placeOrder } from '@/utils/hyperliquid/PlaceOrder'
import { BUILDER_ADDRESS, isTestnet } from '@/utils/constants'
import { getFormattedPrice, getUniverseIndex } from '@/utils/utils'
import { hyperliquidAxios } from '@/config/axios'
import { useAgentApproval } from '@/context/EstablishConnection'
import SmallModal from '../../../common/SmallModal'

interface TPSLModalProps {
  isOpen: boolean
  onClose: () => void
  tpslAsset: IPositionData
}

function calculatePnL(
  position: IPositionData,
  triggerPrice: number
): { profitPercentage: number; profitAmount: number } {
  const {
    entryPx,
    leverage: { value: lev },
    marginUsed
  } = position

  const delta = triggerPrice - entryPx
  const profitPercentage = (delta / entryPx) * lev
  const profitAmount = marginUsed * profitPercentage

  return {
    profitPercentage: Number((profitPercentage * 100).toFixed(2)),
    profitAmount: Number(profitAmount.toFixed(2))
  }
}

function calculateTriggerFromPercentage(
  position: IPositionData,
  profitPercentage: number
): { triggerPrice: number; profitAmount: number } {
  const {
    entryPx,
    leverage: { value: lev },
    marginUsed
  } = position

  const deltaPrice = (profitPercentage * entryPx) / lev
  const triggerPrice = entryPx + deltaPrice
  const profitAmount = marginUsed * profitPercentage

  return { triggerPrice, profitAmount }
}

function calculateTriggerFromAmount(
  position: IPositionData,
  profitAmount: number
): { triggerPrice: number; profitPercentage: number } {
  const entryPx = position.entryPx
  const positionSize = Number(position.szi)
  const deltaPrice = profitAmount / positionSize
  const triggerPrice = entryPx + deltaPrice
  const profitPercentage = (deltaPrice / entryPx) * 100
  return {
    triggerPrice: Number(triggerPrice.toFixed(4)),
    profitPercentage: Number(profitPercentage.toFixed(2))
  }
}

const TPSLModal: React.FC<TPSLModalProps> = ({ isOpen, onClose, tpslAsset }) => {
  const [tpTriggerPrice, setTpTriggerPrice] = useState('')
  const [slTriggerPrice, setSlTriggerPrice] = useState('')
  const [tpValue, setTpValue] = useState('')
  const [slValue, setSlValue] = useState('')
  const [tpPercent, setTpPercent] = useState('')
  const [slPercent, setSlPercent] = useState('')
  const [tpMode, setTpMode] = useState<'$' | '%'>('%')
  const [slMode, setSlMode] = useState<'$' | '%'>('%')
  const [configureAmount, setConfigureAmount] = useState(false)
  const [amount, setAmount] = useState('')
  const [limitPrice, setLimitPrice] = useState(false)
  const [tpLimitPrice, setTpLimitPrice] = useState('')
  const [slLimitPrice, setSlLimitPrice] = useState('')

  const { data: universe } = usePerpsUniverse()
  const { perpAssetContext, agentWallet } = useHyperliquid()
  const { currentFeeApproval } = useAgentApproval()

  const assetCtx = useMemo(() => {
    const assetIndex = universe.findIndex((item) => item.name === tpslAsset.coin)
    return assetIndex !== -1 ? perpAssetContext[assetIndex] : null
  }, [perpAssetContext, tpslAsset.coin, universe])

  const entryPrice = Number(tpslAsset.entryPx)
  const markPrice = Number(assetCtx?.markPx)
  const position = Number(tpslAsset.szi)

  const handleTpPriceChange = (value: string) => {
    setTpTriggerPrice(value)
    if (value) {
      const { profitPercentage, profitAmount } = calculatePnL(tpslAsset, Number(value))
      setTpPercent(profitPercentage.toString())
      setTpValue(profitAmount.toString())
    }
  }

  const handleSlPriceChange = (value: string) => {
    setSlTriggerPrice(value)
    if (value) {
      const { profitPercentage, profitAmount } = calculatePnL(tpslAsset, Number(value))
      setSlPercent(profitPercentage.toString())
      setSlValue(profitAmount.toString())
    }
  }

  const handleTpValueChange = (value: string) => {
    if (tpMode === '%') {
      setTpPercent(value)
      if (value) {
        const { triggerPrice, profitAmount } = calculateTriggerFromPercentage(
          tpslAsset,
          Number(value) / 100
        )
        setTpValue(profitAmount.toString())
        setTpTriggerPrice(triggerPrice.toString())
      }
    } else {
      setTpValue(value)
      if (value) {
        const numValue = Number(value)
        const { triggerPrice, profitPercentage } = calculateTriggerFromAmount(tpslAsset, numValue)
        setTpPercent(profitPercentage.toString())
        setTpTriggerPrice(triggerPrice.toString())
      }
    }
  }

  const handleSlValueChange = (value: string) => {
    if (slMode === '%') {
      setSlPercent(value)
      if (value) {
        const { triggerPrice, profitAmount } = calculateTriggerFromPercentage(
          tpslAsset,
          -Number(value) / 100
        )
        setSlValue(profitAmount.toString())
        setSlTriggerPrice(triggerPrice.toString())
      }
    } else {
      setSlValue(value)
      if (value) {
        const numValue = Number(value)
        const { triggerPrice, profitPercentage } = calculateTriggerFromAmount(tpslAsset, -numValue)
        setSlPercent(profitPercentage.toString())
        setSlTriggerPrice(triggerPrice.toString())
      }
    }
  }

  const handleTpModeChange = (mode: '$' | '%') => {
    setTpMode(mode)
    if (tpTriggerPrice) {
      const { profitPercentage, profitAmount } = calculatePnL(tpslAsset, Number(tpTriggerPrice))
      setTpPercent(profitPercentage.toString())
      setTpValue(profitAmount.toString())
    }
  }

  const handleSlModeChange = (mode: '$' | '%') => {
    setSlMode(mode)
    if (slTriggerPrice) {
      const { profitPercentage, profitAmount } = calculatePnL(tpslAsset, Number(slTriggerPrice))
      setSlPercent(profitPercentage.toString())
      setSlValue(profitAmount.toString())
    }
  }

  return (
    <SmallModal isOpen={isOpen} onClose={onClose} heading={`TP/SL for ${tpslAsset.coin}`}>
      <div className="mb-4">
        <div className="flex justify-between text-sm text-[#E8E0F1] mb-1">
          <span>Coin</span>
          <span>{tpslAsset.coin}</span>
        </div>
        <div className="flex justify-between text-sm text-[#E8E0F1] mb-1">
          <span>Position</span>
          <span>
            {position} {tpslAsset.coin}
          </span>
        </div>
        <div className="flex justify-between text-sm text-[#E8E0F1] mb-1">
          <span>Entry Price</span>
          <span>{entryPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-[#E8E0F1] mb-4">
          <span>Mark Price</span>
          <span>{markPrice.toLocaleString()}</span>
        </div>
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <label className="block text-xs text-[#E8E0F1] mb-1">TP Price</label>
            <input
              className="w-full bg-[#322944] text-white rounded px-2 py-1"
              value={tpTriggerPrice}
              onChange={(e) => handleTpPriceChange(e.target.value)}
              placeholder="TP Price"
              type="number"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-[#E8E0F1] mb-1">TP Value</label>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-[#322944] text-white rounded px-2 py-1"
                value={tpMode === '%' ? tpPercent : tpValue}
                onChange={(e) => handleTpValueChange(e.target.value)}
                placeholder="TP Value"
                type="number"
              />
              <select
                className="bg-[#322944] text-white rounded px-2 py-1"
                value={tpMode}
                onChange={(e) => handleTpModeChange(e.target.value as '$' | '%')}
              >
                <option value="%">%</option>
                <option value="$">$</option>
              </select>
            </div>
          </div>
        </div>
        <div className="text-xs text-[#E8E0F1] mb-2">
          Expected profit:{' '}
          {tpTriggerPrice
            ? tpMode === '%'
              ? `${((Number(tpTriggerPrice) - entryPrice) * position).toFixed(2)} $`
              : `${Number(tpPercent).toFixed(2)}%`
            : '0.00'}
        </div>
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <label className="block text-xs text-[#E8E0F1] mb-1">SL Price</label>
            <input
              className="w-full bg-[#322944] text-white rounded px-2 py-1"
              value={slTriggerPrice}
              onChange={(e) => handleSlPriceChange(e.target.value)}
              placeholder="SL Price"
              type="number"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-[#E8E0F1] mb-1">SL Value</label>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-[#322944] text-white rounded px-2 py-1"
                value={slMode === '%' ? slPercent : slValue}
                onChange={(e) => handleSlValueChange(e.target.value)}
                placeholder="SL Value"
                type="number"
              />
              <select
                className="bg-[#322944] text-white rounded px-2 py-1"
                value={slMode}
                onChange={(e) => handleSlModeChange(e.target.value as '$' | '%')}
              >
                <option value="%">%</option>
                <option value="$">$</option>
              </select>
            </div>
          </div>
        </div>
        <div className="text-xs text-[#E8E0F1] mb-2">
          Expected loss:{' '}
          {slTriggerPrice
            ? slMode === '%'
              ? `${((entryPrice - Number(slTriggerPrice)) * position).toFixed(2)} $`
              : `${Number(slPercent).toFixed(2)}%`
            : '0.00'}
        </div>
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={configureAmount}
            onChange={() => setConfigureAmount(!configureAmount)}
            className="mr-2"
          />
          <span className="text-xs text-[#E8E0F1]">Configure Amount</span>
          {configureAmount && (
            <div className="ml-4 flex items-center gap-2">
              <input
                type="range"
                min="0"
                max={Math.abs(position)}
                step={Math.abs(position) / 100}
                value={amount ? Number(amount) : 0}
                onChange={(e) => setAmount(e.target.value)}
                className="w-32"
              />
              <input
                className="w-24 bg-[#322944] text-white rounded px-2 py-1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="BTC"
                type="number"
                min="0"
                max={Math.abs(position)}
                step={Math.abs(position) / 100}
              />
              <span className="text-xs text-[#E8E0F1]">{tpslAsset.coin}</span>
            </div>
          )}
        </div>
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={limitPrice}
            onChange={() => setLimitPrice(!limitPrice)}
            className="mr-2"
          />
          <span className="text-xs text-[#E8E0F1]">Limit Price</span>
          {limitPrice && (
            <>
              <input
                className="ml-4 w-24 bg-[#322944] text-white rounded px-2 py-1"
                value={tpLimitPrice}
                onChange={(e) => setTpLimitPrice(e.target.value)}
                placeholder="TP Limit Price"
                type="number"
              />
              <input
                className="ml-2 w-24 bg-[#322944] text-white rounded px-2 py-1"
                value={slLimitPrice}
                onChange={(e) => setSlLimitPrice(e.target.value)}
                placeholder="SL Limit Price"
                type="number"
              />
            </>
          )}
        </div>
        <button
          className="w-full mt-4 py-2 bg-[#00E0CA] text-[#18122B] font-semibold rounded-lg hover:bg-[#00bfae] transition"
          onClick={async () => {
            if (!agentWallet) return
            const orders: OrderData[] = []
            const assetIndex = getUniverseIndex(universe, tpslAsset.coin)
            const isBuy = !(tpslAsset.szi > 0)
            if (tpTriggerPrice) {
              const multiplier = isBuy ? 1.1 : 0.9
              const price = tpLimitPrice
                ? tpLimitPrice
                : (Number(tpTriggerPrice) * multiplier).toString()
              const isMarket = tpLimitPrice ? false : true
              const formattedTriggerPrice = getFormattedPrice({
                price: Number(tpTriggerPrice),
                isSpot: false,
                szDecimals: universe[assetIndex].szDecimals
              })
              const formattedPrice = getFormattedPrice({
                price: Number(price),
                isSpot: false,
                szDecimals: universe[assetIndex].szDecimals
              })
              orders.push({
                assetIndex,
                isBuy,
                price: formattedPrice,
                size: Number(amount).toString(),
                reduceOnly: true,
                orderType: {
                  trigger: {
                    isMarket,
                    triggerPx: formattedTriggerPrice,
                    tpsl: 'tp'
                  }
                }
              })
            }
            if (slTriggerPrice) {
              const multiplier = isBuy ? 0.9 : 1.1
              const price = slLimitPrice
                ? slLimitPrice
                : (Number(slTriggerPrice) * multiplier).toString()
              const isMarket = slLimitPrice ? false : true
              const formattedSlTriggerPrice = getFormattedPrice({
                price: Number(slTriggerPrice),
                isSpot: false,
                szDecimals: universe[assetIndex].szDecimals
              })
              const formattedPrice = getFormattedPrice({
                price: Number(price),
                isSpot: false,
                szDecimals: universe[assetIndex].szDecimals
              })
              orders.push({
                assetIndex,
                isBuy,
                price: formattedPrice,
                size: Number(amount).toString(),
                reduceOnly: true,
                orderType: {
                  trigger: {
                    isMarket,
                    triggerPx: formattedSlTriggerPrice,
                    tpsl: 'sl'
                  }
                }
              })
            }
            const res = await placeOrder(agentWallet, isTestnet, hyperliquidAxios, {
              orders: orders,
              grouping: 'positionTpsl',
              builder: {
                address: BUILDER_ADDRESS,
                fee: currentFeeApproval
              }
            })
            console.log(res)
          }}
        >
          Confirm
        </button>
        <div className="text-xs text-[#E8E0F1] mt-4 opacity-70">
          By default take-profit and stop-loss orders apply to the entire position. Take-profit and
          stop-loss automatically cancel after closing the position. A market order is triggered
          when the stop loss or take profit price is reached.
          <br />
          If the order size is configured above, the TP/SL order will be for that size no matter how
          the position changes in the future.
        </div>
      </div>
    </SmallModal>
  )
}

export default TPSLModal
