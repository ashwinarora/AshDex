import React, { useState, useEffect, useMemo } from 'react'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import { placeOrder } from '@/utils/hyperliquid/PlaceOrder'
import { formatPrice, getUniverseIndex } from '@/utils/utils'
import { hyperliquidAxios } from '@/config/axios'
import { isTestnet } from '@/utils/constants'
import { toast } from 'react-toastify'
import { IPositionData } from '@/utils/hyperliquid/hyperLiquidTypes'
import SmallModal from '../../../common/SmallModal'

interface LimitCloseModalProps {
  isOpen: boolean
  onClose: () => void
  closingAsset: string
}

const LimitCloseModal: React.FC<LimitCloseModalProps> = ({ isOpen, onClose, closingAsset }) => {
  const { clearingHouseState, agentWallet, allMids, sdk } = useHyperliquid()
  const { data: universe } = usePerpsUniverse()
  const [price, setPrice] = useState<string>('')
  const [size, setSize] = useState<string>('')
  const [sizeType, setSizeType] = useState<'asset' | 'usd'>('asset')
  const [position, setPosition] = useState<IPositionData | null>(null)
  const [percent, setPercent] = useState<number>(0)
  const [lastChanged, setLastChanged] = useState<'percent' | 'size' | null>(null)

  useEffect(() => {
    if (clearingHouseState?.assetPositions && closingAsset) {
      const pos = clearingHouseState.assetPositions.find((p) => p.position.coin === closingAsset)
      if (pos) {
        setPosition(pos.position)
        setPrice((prev) => {
          if (prev === '' || prev === undefined) {
            const mid = allMids[closingAsset]
            return mid ? mid.toString() : ''
          }
          return prev
        })
      }
    }
  }, [clearingHouseState, closingAsset])

  function trimDecimals(value: string, decimals: number) {
    if (!value) return value
    const [int, dec] = value.split('.')
    if (!decimals || !dec) return value
    return `${int}.${dec.slice(0, decimals)}`
  }

  // Update size when percent changes
  useEffect(() => {
    if (lastChanged === 'percent' && position) {
      const absSzi = Math.abs(position.szi)
      const assetIndex = universe ? getUniverseIndex(universe, position.coin) : 0
      const szDecimals = universe ? universe[assetIndex].szDecimals : 8
      if (sizeType === 'asset') {
        const newSize = (percent / 100) * absSzi
        setSize(trimDecimals(newSize.toString(), szDecimals))
      } else if (sizeType === 'usd' && price) {
        const px = parseFloat(price)
        const usdValue = (percent / 100) * absSzi * px
        setSize(trimDecimals(usdValue.toString(), szDecimals))
      }
    }
  }, [percent, position, sizeType, price, lastChanged, universe])

  // Update percent when size changes
  useEffect(() => {
    if (lastChanged === 'size' && position) {
      const absSzi = Math.abs(position.szi)
      if (sizeType === 'asset') {
        const sizeNum = parseFloat(size)
        const newPercent = absSzi > 0 ? Math.min(100, Math.max(0, (sizeNum / absSzi) * 100)) : 0
        setPercent(Number.isNaN(newPercent) ? 0 : newPercent)
      } else if (sizeType === 'usd' && price) {
        const px = parseFloat(price)
        const usdNum = parseFloat(size)
        const newPercent =
          absSzi > 0 && px > 0 ? Math.min(100, Math.max(0, (usdNum / (absSzi * px)) * 100)) : 0
        setPercent(Number.isNaN(newPercent) ? 0 : newPercent)
      }
    }
  }, [size, position, sizeType, price, lastChanged])

  // Calculate estimated closed PnL with useMemo
  const estPnl = useMemo(() => {
    if (position && price && size) {
      const closeSize = parseFloat(size)
      const entryPx = position.entryPx
      const closePx = parseFloat(price)
      const isLong = position.szi > 0
      const pnlPerUnit = isLong ? closePx - entryPx : entryPx - closePx
      return closeSize * pnlPerUnit
    }
    return null
  }, [position, price, size])

  const handleClosePosition = async () => {
    if (!agentWallet || !position || !universe) return

    const assetIndex = getUniverseIndex(universe, position.coin)
    const szDecimals = universe[assetIndex].szDecimals
    const tif = 'Gtc'
    const isBuy = !(position.szi > 0)

    let finalSize = size
    if (sizeType === 'usd') {
      const priceNum = parseFloat(price)
      const sizeNum = parseFloat(size)
      finalSize = (sizeNum / priceNum).toFixed(szDecimals)
    } else {
      finalSize = parseFloat(size).toFixed(szDecimals)
    }

    const toastId = toast.loading('Closing position...')
    try {
      const res = await sdk.exchange.updateLeverage(
        position.coin,
        position.leverage.type,
        position.leverage.value
      )
      console.log(res)

      const order = await placeOrder(agentWallet, isTestnet, hyperliquidAxios, {
        grouping: 'na',
        orders: [
          {
            assetIndex: assetIndex,
            isBuy: isBuy,
            reduceOnly: true,
            price: formatPrice(parseFloat(price), szDecimals).toString(),
            size: finalSize.replace(/\.?0+$/, ''),
            orderType: {
              limit: {
                tif: tif
              }
            }
          }
        ]
      })
      console.log(order)
      const status = order.data.response.data.statuses[0]
      if (status.error) {
        toast.update(toastId, {
          render: '❌' + status.error,
          type: 'error',
          isLoading: false,
          autoClose: 3000
        })
      } else {
        toast.update(toastId, {
          render: '✅ Order placed successfully',
          type: 'success',
          isLoading: false,
          autoClose: 2000
        })
        onClose()
      }
    } catch (error) {
      console.error('Error closing position:', error)
      toast.update(toastId, {
        render: '❌' + error,
        type: 'error',
        isLoading: false,
        autoClose: 2000
      })
    }
  }

  return (
    <SmallModal isOpen={isOpen} onClose={onClose} heading="Limit Close">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#8B8BA0] mb-1">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-[#322944] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#7D67FF]"
            placeholder="Enter price"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#8B8BA0] mb-1">Size</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={size}
              onChange={(e) => {
                const assetIndex = universe ? getUniverseIndex(universe, closingAsset) : 0
                const szDecimals = universe ? universe[assetIndex].szDecimals : 8
                setSize(trimDecimals(e.target.value, szDecimals))
                setLastChanged('size')
              }}
              className="flex-1 bg-[#322944] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#7D67FF]"
              placeholder="Enter size"
            />
            <select
              value={sizeType}
              onChange={(e) => setSizeType(e.target.value as 'asset' | 'usd')}
              className="bg-[#322944] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#7D67FF]"
            >
              <option value="asset">{closingAsset}</option>
              <option value="usd">USD</option>
            </select>
          </div>
          {position && (
            <div className="flex items-center mt-4">
              <input
                type="range"
                min={0}
                max={100}
                step={0.01}
                value={percent}
                onChange={(e) => {
                  setPercent(Number(e.target.value))
                  setLastChanged('percent')
                }}
                className="w-full accent-[#7D67FF] h-2 bg-[#231B36] rounded-lg appearance-none focus:outline-none slider-thumb"
                style={{ accentColor: '#7D67FF' }}
              />
              <div className="ml-4 px-4 py-2 bg-[#231B36] rounded-lg border border-white/10 text-white text-lg font-medium min-w-[90px] text-center flex items-center justify-center whitespace-nowrap">
                {percent.toFixed(2)} %
              </div>
            </div>
          )}
        </div>
        {/* Estimated PnL */}
        {estPnl !== null && (
          <div className="text-sm mt-2">
            Estimated closed PnL (without fees):
            <span
              className={
                'ml-1 font-semibold ' +
                (estPnl > 0 ? 'text-[#3FE17C]' : estPnl < 0 ? 'text-[#FF5A5A]' : 'text-white')
              }
            >
              {estPnl > 0 ? '+' : ''}$
              {estPnl.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
        )}
        <button
          onClick={handleClosePosition}
          className="w-full bg-[#7D67FF] text-white py-2 rounded-lg font-medium hover:bg-[#6B57E6] transition mt-4"
        >
          Confirm
        </button>
      </div>
    </SmallModal>
  )
}

export default LimitCloseModal
