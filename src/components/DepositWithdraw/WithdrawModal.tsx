import React, { useState } from 'react'
import Modal from '../common/Modal'
import { ChevronDown, X } from 'lucide-react'
import Image from 'next/image'
import arbitrum from '@/assets/images/arbitrum.svg'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { useAccount, useSignTypedData } from 'wagmi'
import { getWithrawalPayload } from '@/utils/hyperliquid/Withdraw'
import { splitSignature } from '@/utils/utils'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
}

const WithdrawModal = ({ isOpen, onClose }: WithdrawModalProps) => {
  const { address, chainId } = useAccount()
  const [amount, setAmount] = useState<string>('')
  const { clearingHouseState, isTestnet, hyperliquidAxios } = useHyperLiquid()
  const { signTypedDataAsync } = useSignTypedData()

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        className=" flex flex-col rounded-lg w-4/12 bg-secondary border border-gray-300 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Withdraw from Nexon</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-200 rounded-full p-2 cursor-pointer bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <label htmlFor="chain" className="text-sm font-medium text-gray-300">
            Select Chain
          </label>
          <div className="relative w-2/3">
            <select
              id="chain"
              className="block w-full bg-gray-700 border border-gray-500 text-gray-300 rounded-lg py-2 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ethereum">Arbitrum</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex flex-col items-center mb-4">
          <Image src={arbitrum} alt="test" width={50} height={50} />
          <h3 className="text-2xl font-medium text-gray-300 mb-2">Deposit USDC on Arbitrum</h3>
          <div className="text-sm text-gray-400 text-center">
            USDC will be sent over the Arbitrum network to your address. A 1 USDC fee will be
            deducted from the withdrawal amount. Processing usually takes under 5 minutes.
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="amount"
            className="text-sm font-medium text-gray-300 flex justify-between"
          >
            <div>Amount</div>
            <div>Balance: {clearingHouseState?.withdrawable} USDC</div>
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
              onClick={() => setAmount(clearingHouseState?.withdrawable.toString() ?? '0')}
              className="absolute right-14 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white text-sm font-medium py-1 px-3 rounded-lg hover:bg-blue-600 focus:outline-none"
            >
              Max
            </button>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300">
              USDC
            </span>
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-500 w-full text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none"
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 w-full text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none"
            onClick={async () => {
              if (!chainId) return
              if (!address) return
              try {
                const payload = getWithrawalPayload({
                  chainId: chainId,
                  isTestnet: isTestnet,
                  amount: amount,
                  destination: address,
                  nonce: Date.now()
                })
                const sign = await signTypedDataAsync(payload)
                const body = {
                  action: {
                    type: payload.message.type,
                    amount: payload.message.amount,
                    destination: payload.message.destination,
                    time: payload.message.time,
                    signatureChainId: payload.message.signatureChainId,
                    hyperliquidChain: payload.message.hyperliquidChain
                  },
                  nonce: payload.message.time,
                  signature: splitSignature(sign)
                }
                const res = await hyperliquidAxios.post('/exchange', body)
                console.log('Withdraw response:', res)
              } catch (error) {
                console.error('Error withdrawing:', error)
              }
            }}
          >
            Withdraw
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default WithdrawModal
