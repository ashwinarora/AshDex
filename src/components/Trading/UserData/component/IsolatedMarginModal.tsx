import React, { useState } from 'react'
import SmallModal from '../../../common/SmallModal'
import { IPositionData } from '@/utils/hyperliquid/hyperLiquidTypes'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { toast } from 'react-toastify'

interface IsolatedMarginModalProps {
  isOpen: boolean
  onClose: () => void
  asset: IPositionData
}

const IsolatedMarginModal: React.FC<IsolatedMarginModalProps> = ({ isOpen, onClose, asset }) => {
  const { clearingHouseState } = useHyperliquid()
  const [amount, setAmount] = useState('')
  const [action, setAction] = useState<'Add' | 'Remove'>('Add')
  const { sdk } = useHyperliquid()

  const marginAvailable = clearingHouseState?.withdrawable || 0

  return (
    <SmallModal isOpen={isOpen} onClose={onClose} heading="Adjust Margin">
      <div className="space-y-6">
        <div className="text-sm text-[#E8E0F1]">
          <p>
            Decrease the chance of liquidation by adding more margin or remove excess margin to use
            for other positions.
          </p>
        </div>
        <div className="bg-[#1A1331] rounded-xl border border-white/10 px-5 py-4 flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#8B8BA0]">Current margin for {asset.coin}-USD</span>
            <span className="text-white font-medium">
              {asset.marginUsed.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}{' '}
              USD
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#8B8BA0]">Margin available to add</span>
            <span className="text-white font-medium">
              {marginAvailable.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}{' '}
              USD
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="w-full bg-[#251B3A] border border-white/10 rounded-lg px-4 py-3 text-white text-base font-medium placeholder:text-[#8B8BA0] focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B8BA0] bg-[#322944] px-2 py-1 rounded font-medium text-xs cursor-pointer"
              onClick={() => setAmount(marginAvailable.toString())}
            >
              MAX
            </button>
          </div>
          <div>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as 'Add' | 'Remove')}
              className="bg-[#251B3A] border border-white/10 rounded-lg px-4 py-3 text-white text-base font-medium focus:outline-none"
            >
              <option value="Add">Add</option>
              <option value="Remove">Remove</option>
            </select>
          </div>
        </div>
        <button
          className="w-full bg-[#7D67FF] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#6B57E6] transition"
          onClick={async () => {
            const isBuy = asset.szi > 0
            const toastId = toast.loading('Updating margin...')
            const realAmount = Number(amount) * 10 ** 6
            try {
              const res = await sdk.exchange.updateIsolatedMargin(
                asset.coin,
                isBuy,
                action === 'Add' ? realAmount : -realAmount
              )
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
