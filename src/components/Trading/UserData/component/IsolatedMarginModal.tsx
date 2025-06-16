import React, { useState } from 'react'
import SmallModal from '../../../common/SmallModal'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { toast } from 'react-toastify'
import { AssetPosition } from '@nktkas/hyperliquid'
import { getUniverseIndex } from '@/utils/utils'

interface IsolatedMarginModalProps {
  isOpen: boolean
  onClose: () => void
  asset: AssetPosition['position']
}

const IsolatedMarginModal: React.FC<IsolatedMarginModalProps> = ({ isOpen, onClose, asset }) => {
  const { clearingHouseState, perpsMeta } = useHyperliquid()
  const [amount, setAmount] = useState('')
  const [action, setAction] = useState<'Add' | 'Remove'>('Add')
  const { sdkExchangeClient } = useHyperliquid()

  const marginAvailable = clearingHouseState?.withdrawable || 0

  return (
    <SmallModal isOpen={isOpen} onClose={onClose} heading="Adjust Margin">
      <div className="space-y-6">
        <div className="text-[#E8E0F1] text-sm">
          <p>
            Decrease the chance of liquidation by adding more margin or remove excess margin to use
            for other positions.
          </p>
        </div>
        <div className="flex flex-col gap-2 bg-[#1A1331] px-5 py-4 border border-white/10 rounded-xl">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#8B8BA0]">Current margin for {asset.coin}-USD</span>
            <span className="font-medium text-white">
              {Number(asset.marginUsed).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}{' '}
              USD USD
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#8B8BA0]">Margin available to add</span>
            <span className="font-medium text-white">
              {marginAvailable.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}{' '}
              USD
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="bg-[#251B3A] px-4 py-3 border border-white/10 rounded-lg focus:outline-none w-full font-medium text-white placeholder:text-[#8B8BA0] text-base"
            />
            <button
              type="button"
              className="top-1/2 right-3 absolute bg-[#322944] px-2 py-1 rounded font-medium text-[#8B8BA0] text-xs -translate-y-1/2 cursor-pointer"
              onClick={() => setAmount(marginAvailable.toString())}
            >
              MAX
            </button>
          </div>
          <div>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as 'Add' | 'Remove')}
              className="bg-[#251B3A] px-4 py-3 border border-white/10 rounded-lg focus:outline-none font-medium text-white text-base"
            >
              <option value="Add">Add</option>
              <option value="Remove">Remove</option>
            </select>
          </div>
        </div>
        <button
          className="bg-[#7D67FF] hover:bg-[#6B57E6] py-3 rounded-lg w-full font-semibold text-white text-lg transition"
          onClick={async () => {
            const isBuy = Number(asset.szi) > 0
            const toastId = toast.loading('Updating margin...')
            const realAmount = Number(amount) * 10 ** 6
            try {
              if (!sdkExchangeClient) return
              if (!perpsMeta) return
              const assetIndex = getUniverseIndex(perpsMeta.universe, asset.coin)
              const res = await sdkExchangeClient.updateIsolatedMargin({
                asset: assetIndex,
                isBuy: isBuy,
                ntli: action === 'Add' ? realAmount : -realAmount
              })
              // const res = await sdkExchangeClient.updateIsolatedMargin(
              //   asset.coin,
              //   isBuy,
              //   action === 'Add' ? realAmount : -realAmount
              // )
              console.log(res)
              toast.update(toastId, {
                render: '✅ Margin updated successfully',
                type: 'success',
                isLoading: false,
                autoClose: 2000
              })
            } catch (error) {
              console.error(error)
              toast.update(toastId, {
                render: '❌' + error,
                type: 'error',
                isLoading: false,
                autoClose: 2000
              })
            }
          }}
        >
          Confirm
        </button>
      </div>
    </SmallModal>
  )
}

export default IsolatedMarginModal
