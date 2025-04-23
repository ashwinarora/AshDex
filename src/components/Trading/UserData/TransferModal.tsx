import { useHyperLiquid } from '@/context/HyperLiquid'
import { getUsdClassTransferPayload } from '@/utils/hyperliquid/UsdClassTransfer'
import { splitSignature } from '@/utils/utils'
import { X } from 'lucide-react'
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { useAccount, useSignTypedData } from 'wagmi'

interface ITransferModal {
  isOpen: boolean
  onClose: () => void
}

const TransferModal = ({ isOpen, onClose }: ITransferModal) => {
  const { chainId } = useAccount()
  const [amount, setAmount] = useState<string>('')
  const [toPerp, setToPerp] = useState(false)
  const { clearingHouseState, spotState, isTestnet, hyperliquidAxios } = useHyperLiquid()
  const { signTypedDataAsync } = useSignTypedData()

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getBalance = () => {
    if (toPerp) {
      return (
        spotState?.balances?.find((balance) => balance.coin === 'USDC')?.total.toString() ?? '0'
      )
    } else {
      return clearingHouseState?.withdrawable.toString() ?? '0'
    }
  }

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-[#0F081680] bg-opacity-70 backdrop-blur-[40px] flex justify-center items-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-secondary text-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Transfer between Perp and Spot</h2>
          <button
            className="text-xl font-bold text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div
            className={`p-4 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 border rounded-lg w-24 text-center`}
          >
            {toPerp ? 'Spot' : 'Perp'}
          </div>
          <button
            className="mx-4 text-xl dark:text-gray-300"
            onClick={() => setToPerp((prev) => !prev)}
          >
            →
          </button>
          <div className={`p-4 bg-blue-500 text-white border rounded-lg w-24 text-center`}>
            {!toPerp ? 'Spot' : 'Perp'}
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="amount"
            className="text-sm font-medium text-gray-300 flex justify-between"
          >
            <div>Amount</div>
            <div>Balance: {getBalance()} USDC</div>
          </label>
          <div className="relative mt-2">
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full bg-gray-700 border border-gray-500 text-gray-300 rounded-lg py-2 px-3 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount"
            />
            <button
              onClick={() => setAmount(getBalance())}
              className="absolute right-14 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white text-sm font-medium py-1 px-3 rounded-lg hover:bg-blue-600 focus:outline-none"
            >
              Max
            </button>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300">
              USDC
            </span>
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={async () => {
              if (!chainId) return
              try {
                const payload = getUsdClassTransferPayload({
                  chainId: chainId,
                  isTestnet: isTestnet,
                  amount: amount,
                  toPerp: toPerp,
                  nonce: Date.now()
                })
                const sign = await signTypedDataAsync(payload)
                const body = {
                  action: {
                    type: payload.message.type,
                    amount: payload.message.amount,
                    toPerp: payload.message.toPerp,
                    nonce: payload.message.nonce,
                    signatureChainId: payload.message.signatureChainId,
                    hyperliquidChain: payload.message.hyperliquidChain
                  },
                  nonce: payload.message.nonce,
                  signature: splitSignature(sign)
                }
                const res = await hyperliquidAxios.post('/exchange', body)
                console.log('Transfer response:', res.data)
                onClose()
              } catch (error) {
                console.error('Transfer failed:', error)
              }
            }}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Transfer to {toPerp ? 'Perp' : 'Spot'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default TransferModal
