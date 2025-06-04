import React, { useState } from 'react'
import SmallModal from '../../../common/SmallModal'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import { formatPrice, getUniverseIndex } from '@/utils/utils'
import { hyperliquidAxios } from '@/config/axios'
import { isTestnet } from '@/utils/constants'
import { toast } from 'react-toastify'
import { OrderData, placeOrder } from '@/utils/hyperliquid/PlaceOrder'

interface CloseAllModalProps {
  isOpen: boolean
  onClose: () => void
}

const CloseAllModal: React.FC<CloseAllModalProps> = ({ isOpen, onClose }) => {
  const [selected, setSelected] = useState<'market' | 'limit'>('market')
  const { clearingHouseState, agentWallet, allMids } = useHyperliquid()
  const { data: universe } = usePerpsUniverse()

  const handleCloseAll = async () => {
    if (!agentWallet || !clearingHouseState?.assetPositions || !universe) return
    const toastId = toast.loading('Closing all positions...')
    try {
      // Update leverage for all positions first
      //   for (const posObj of clearingHouseState.assetPositions) {
      //     const pos = posObj.position
      //     await sdk.exchange.updateLeverage(
      //       pos.coin,
      //       pos.leverage.type,
      //       pos.leverage.value
      //     )
      //   }
      // Build orders array
      const orders: OrderData[] = clearingHouseState.assetPositions.map((posObj) => {
        const pos = posObj.position
        const assetIndex = getUniverseIndex(universe, pos.coin)
        const szDecimals = universe[assetIndex].szDecimals
        const isBuy = !(pos.szi > 0)
        const absSize = Math.abs(pos.szi).toFixed(szDecimals)
        const mid = allMids[pos.coin]
        let price: number
        if (selected === 'market') {
          price = isBuy ? mid * 1.1 : mid * 0.9
        } else {
          price = mid
        }
        return {
          assetIndex: assetIndex,
          isBuy: isBuy,
          reduceOnly: true,
          price: formatPrice(price, szDecimals).toString(),
          size: absSize.replace(/\.?0+$/, ''),
          orderType: {
            limit: {
              tif: 'Gtc'
            }
          }
        }
      })
      const orderRes = await placeOrder(agentWallet, isTestnet, hyperliquidAxios, {
        grouping: 'na',
        orders: orders
      })
      const statuses = orderRes.data.response.data.statuses
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasError = statuses.some((s: any) => s.error)
      if (hasError) {
        toast.update(toastId, {
          render: '❌ Some orders failed',
          type: 'error',
          isLoading: false,
          autoClose: 3000
        })
      } else {
        toast.update(toastId, {
          render: '✅ All positions closed successfully',
          type: 'success',
          isLoading: false,
          autoClose: 2000
        })
        onClose()
      }
    } catch (error) {
      console.error('Error closing all positions:', error)
      toast.update(toastId, {
        render: '❌' + error,
        type: 'error',
        isLoading: false,
        autoClose: 2000
      })
    }
  }

  return (
    <SmallModal isOpen={isOpen} onClose={onClose} heading="Confirm Close All">
      <div className="p-6 rounded-xl">
        <p className="text-[#B0B1C3] text-sm mb-6">
          This will close all your positions and cancel their associated TP/SL orders.
        </p>
        <div className="flex flex-col gap-4 mb-8">
          <label className="flex items-center cursor-pointer gap-3">
            <input
              type="radio"
              className="accent-[#7D67FF] w-5 h-5"
              checked={selected === 'market'}
              onChange={() => setSelected('market')}
            />
            <span className="text-white text-base">Market Close</span>
          </label>
          <label className="flex items-center cursor-pointer gap-3">
            <input
              type="radio"
              className="accent-[#7D67FF] w-5 h-5"
              checked={selected === 'limit'}
              onChange={() => setSelected('limit')}
            />
            <span className="text-[#B0B1C3] text-base">Limit Close at Mid Price</span>
          </label>
        </div>
        <button
          className="w-full bg-[#7D67FF] text-white py-2 rounded-lg font-medium hover:bg-[#6B57E6] transition text-base"
          onClick={handleCloseAll}
        >
          {selected === 'market' ? 'Confirm Market Close' : 'Confirm Limit Close at Mid Price'}
        </button>
      </div>
    </SmallModal>
  )
}

export default CloseAllModal
