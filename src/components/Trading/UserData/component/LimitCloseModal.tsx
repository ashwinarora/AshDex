import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { X } from 'lucide-react'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import { placeOrder } from '@/utils/hyperliquid/PlaceOrder'
import { formatPrice, getUniverseIndex } from '@/utils/utils'
import { hyperliquidAxios } from '@/config/axios'
import { isTestnet } from '@/utils/constants'
import { toast } from 'react-toastify'
import { IPositionData } from '@/utils/hyperliquid/hyperLiquidTypes'
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

  // Only set the initial price once when the modal opens, not on every allMids update
  useEffect(() => {
    if (clearingHouseState?.assetPositions && closingAsset) {
      const pos = clearingHouseState.assetPositions.find((p) => p.position.coin === closingAsset)
      if (pos) {
        setPosition(pos.position)
        // Only set initial price if price is not already set (i.e., first open)
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

  const handleClosePosition = async () => {
    if (!agentWallet || !position || !universe) return

    const assetIndex = getUniverseIndex(universe, position.coin)
    const szDecimals = universe[assetIndex].szDecimals
    const tif = 'Gtc'
    const isBuy = !(position.szi > 0)

    // Convert size to asset units if in USD, then fix to szDecimals
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

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 bg-[#0F081680] bg-opacity-30 backdrop-blur-[5px] flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-[#18122B] border border-white/10 rounded-2xl shadow-lg w-full max-w-md max-md:max-w-sm p-6 max-md:p-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Limit Close</h2>
          <button
            className="p-2 bg-[#322944] rounded-full text-[#E8E0F1] hover:text-white hover:bg-[#443366] transition"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
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
                onChange={(e) => setSize(e.target.value)}
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
          </div>
          <button
            onClick={handleClosePosition}
            className="w-full bg-[#7D67FF] text-white py-2 rounded-lg font-medium hover:bg-[#6B57E6] transition"
          >
            Close Position
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default LimitCloseModal
