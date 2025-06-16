import React, { useState, useEffect, useMemo } from 'react'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { formatPrice, getUniverseIndex } from '@/utils/utils'
import { toast } from 'react-toastify'
import SmallModal from '../../../common/SmallModal'
import { AssetPosition } from '@nktkas/hyperliquid'

interface MarketCloseModalProps {
  isOpen: boolean
  onClose: () => void
  closingAsset: string
}

const MarketCloseModal: React.FC<MarketCloseModalProps> = ({ isOpen, onClose, closingAsset }) => {
  const { clearingHouseState, agentWallet, allMids, sdkExchangeClient, perpsMeta } =
    useHyperliquid()
  const [size, setSize] = useState<string>('')
  const [sizeType, setSizeType] = useState<'asset' | 'usd'>('asset')
  const [position, setPosition] = useState<AssetPosition['position'] | null>(null)
  const [percent, setPercent] = useState<number>(0)
  const [lastChanged, setLastChanged] = useState<'percent' | 'size' | null>(null)

  useEffect(() => {
    if (clearingHouseState?.assetPositions && closingAsset) {
      const pos = clearingHouseState.assetPositions.find((p) => p.position.coin === closingAsset)
      if (pos) {
        setPosition(pos.position)
      }
    }
  }, [clearingHouseState, closingAsset])

  function trimDecimals(value: string, decimals: number) {
    if (!value) return value
    const [int, dec] = value.split('.')
    if (!decimals || !dec) return value
    return `${int}.${dec.slice(0, decimals)}`
  }

  useEffect(() => {
    if (lastChanged === 'percent' && position) {
      if (!perpsMeta) return
      const absSzi = Math.abs(Number(position.szi))
      const assetIndex = getUniverseIndex(perpsMeta.universe, position.coin)
      const szDecimals = perpsMeta.universe[assetIndex].szDecimals
      if (sizeType === 'asset') {
        const newSize = (percent / 100) * absSzi
        setSize(trimDecimals(newSize.toString(), szDecimals))
      } else if (sizeType === 'usd' && allMids[position.coin]) {
        const px = allMids[position.coin]
        const usdValue = (percent / 100) * absSzi * Number(px)
        setSize(trimDecimals(usdValue.toString(), szDecimals))
      }
    }
  }, [percent, position, sizeType, allMids, lastChanged, perpsMeta])

  useEffect(() => {
    if (lastChanged === 'size' && position) {
      if (!perpsMeta) return
      const absSzi = Math.abs(Number(position.szi))
      if (sizeType === 'asset') {
        const sizeNum = parseFloat(size)
        const newPercent = absSzi > 0 ? Math.min(100, Math.max(0, (sizeNum / absSzi) * 100)) : 0
        setPercent(Number.isNaN(newPercent) ? 0 : newPercent)
      } else if (sizeType === 'usd' && allMids[position.coin]) {
        const px = allMids[position.coin]
        const usdNum = parseFloat(size)
        const newPercent =
          absSzi > 0 && Number(px) > 0
            ? Math.min(100, Math.max(0, (usdNum / (absSzi * Number(px))) * 100))
            : 0
        setPercent(Number.isNaN(newPercent) ? 0 : newPercent)
      }
    }
  }, [size, position, sizeType, allMids, lastChanged])

  // Calculate estimated closed PnL with useMemo
  const estPnl = useMemo(() => {
    if (position && size && allMids[position.coin]) {
      const closeSize = parseFloat(size)
      const entryPx = position.entryPx
      const closePx = allMids[position.coin]
      const isLong = Number(position.szi) > 0
      const pnlPerUnit = isLong
        ? Number(closePx) - Number(entryPx)
        : Number(entryPx) - Number(closePx)
      return closeSize * pnlPerUnit
    }
    return null
  }, [position, size, allMids])

  const handleClosePosition = async () => {
    if (!agentWallet || !position || !perpsMeta) return

    const assetIndex = getUniverseIndex(perpsMeta.universe, position.coin)
    const szDecimals = perpsMeta.universe[assetIndex].szDecimals
    const isBuy = !(Number(position.szi) > 0)
    const mid = allMids[position.coin]
    const price = isBuy ? Number(mid) * 1.1 : Number(mid) * 0.9
    const tif = 'Gtc'
    let finalSize = size
    if (sizeType === 'usd') {
      const priceNum = parseFloat(price.toString())
      const sizeNum = parseFloat(size)
      finalSize = (sizeNum / priceNum).toFixed(szDecimals)
    } else {
      finalSize = parseFloat(size).toFixed(szDecimals)
    }

    const toastId = toast.loading('Closing position...')
    try {
      if (!sdkExchangeClient) return
      const order = await sdkExchangeClient.order({
        grouping: 'na',
        orders: [
          {
            a: assetIndex,
            b: isBuy,
            p: formatPrice(price, szDecimals).toString(),
            s: finalSize.replace(/\.?0+$/, ''),
            r: false,
            t: {
              limit: {
                tif: tif
              }
            }
          }
        ]
      })
      console.log(order)
      const status = order.response.data.statuses[0]
      if ('error' in status) {
        toast.update(toastId, {
          render: '❌' + status.error,
          type: 'error',
          isLoading: false,
          autoClose: 3000
        })
      } else if ('filled' in status) {
        toast.update(toastId, {
          render: `✅ Position Closed Successfully`,
          type: 'success',
          isLoading: false,
          autoClose: 3000
        })
      } else if ('resting' in status) {
        const resting = status.resting
        if (resting) {
          toast.update(toastId, {
            render: `✅ Order Placed Successfully`,
            type: 'success',
            isLoading: false,
            autoClose: 3000
          })
        }
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
    <SmallModal isOpen={isOpen} onClose={onClose} heading="Market Close">
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-[#8B8BA0] text-sm">Size</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={size}
              onChange={(e) => {
                if (!perpsMeta) return
                const assetIndex = getUniverseIndex(perpsMeta.universe, closingAsset)
                const szDecimals = perpsMeta.universe[assetIndex].szDecimals
                setSize(trimDecimals(e.target.value, szDecimals))
                setLastChanged('size')
              }}
              className="flex-1 bg-[#322944] px-3 py-2 border border-white/10 focus:border-[#7D67FF] rounded-lg focus:outline-none text-white"
              placeholder="Enter size"
            />
            <select
              value={sizeType}
              onChange={(e) => setSizeType(e.target.value as 'asset' | 'usd')}
              className="bg-[#322944] px-3 py-2 border border-white/10 focus:border-[#7D67FF] rounded-lg focus:outline-none text-white"
            >
              <option value="asset">{closingAsset}</option>
              <option value="usd">USD</option>
            </select>
          </div>
          {position && (
            <>
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
                  className="bg-[#231B36] rounded-lg focus:outline-none w-full h-2 accent-[#7D67FF] appearance-none slider-thumb"
                  style={{ accentColor: '#7D67FF' }}
                />
                <div className="flex justify-center items-center bg-[#231B36] ml-4 px-4 py-2 border border-white/10 rounded-lg min-w-[90px] font-medium text-white text-lg text-center whitespace-nowrap">
                  {percent.toFixed(2)} %
                </div>
              </div>
              {/* Estimated PnL */}
              {estPnl !== null && (
                <div className="mt-2 text-sm">
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
            </>
          )}
        </div>
        <button
          onClick={handleClosePosition}
          className="bg-[#7D67FF] hover:bg-[#6B57E6] py-2 rounded-lg w-full font-medium text-white transition"
        >
          Close Position
        </button>
      </div>
    </SmallModal>
  )
}

export default MarketCloseModal
