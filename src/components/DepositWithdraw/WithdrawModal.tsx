import React, { useState } from 'react'
import { useAccount, useSignTypedData } from 'wagmi'
import { ChevronDown, X } from 'lucide-react'
import Image from 'next/image'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { getWithrawalPayload } from '@/utils/hyperliquid/Withdraw'
import { splitSignature } from '@/utils/utils'
import Modal from '../common/Modal'
import arbitrum from '@/assets/images/arbitrum.svg'

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
        className="w-full max-w-md max-md:max-w-sm border-white/10 border-[2px] bg-[#0F0816] max-md:p-3 p-6 rounded-2xl shadow-lg 
          relative lg:static max-lg:fixed max-lg:bottom-4 max-lg:left-1/2 max-lg:-translate-x-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between max-md:mb-0 mb-4 w-full">
          <p className="text-lg text-[#FFFFFF] font-semibold tracking-[0em]">Withdraw to Wallet</p>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 rounded-full text-[#E8E0F1] hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="border-2 max-md:mt-4 border-white/10 rounded-md bg-[#FFFFFF0F] pl-4 py-3 text-white text-sm mb-6 flex items-center justify-between">
          <span className="text-[#8B8BA0] text-sm font-medium">Withdraw Cain</span>
          <div className="relative w-1/4 text-white tracking-normal flex items-center gap-x-1 text-sm font-medium">
            <select id="chain" className="appearance-none focus:outline-none">
              <option value="ethereum">Arbitrum</option>
            </select>
            <ChevronDown className="absolute w-5 h-5 right-1 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-y-2 mb-8">
          <Image src={arbitrum} alt="test" style={{ width: 50, height: 'auto' }} />
          <p className="text-white tracking-normal font-medium">Withdrawal USDC from Arbitrum</p>
          <div className="text-sm text-[#8B8BA0] text-center font-normal">
            USDC will be sent over the Arbitrum network to your address. A 5 USDC fee will be
            deducted from the withdrawal amount. Processing usually takes under 5 minutes.
          </div>
        </div>
        <div className="mb-4">
          <div className="flex mb-2 justify-between font-medium text-sm text-[#8B8BA0]">
            <div>Amount</div>
            <div>Available to withdrawal: {clearingHouseState?.withdrawable} USDC</div>
          </div>
          <div className="relative flex justify-between items-center pr-4 pt-1 border-b border-white/10 pb-3">
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md placeholder:text-[#8B8BA0] py-1 focus:outline-none text-base font-semibold placeholder:opacity-70 text-white pr-28"
              placeholder="00,000.00"
            />
            <button
              onClick={() => setAmount(clearingHouseState?.withdrawable.toString() ?? '0')}
              className="text-sm font-medium p-[8px] text-white bg-white/10 rounded-lg"
            >
              Max
            </button>
          </div>
        </div>
        <div className="flex gap-x-2 justify-between mt-6">
          <button
            onClick={onClose}
            className="text-[#8B8BA0] cursor-pointer w-1/2 text-base font-medium hover:text-white"
          >
            Cancel
          </button>
          <button
            disabled={!amount || parseFloat(amount) === 0}
            className={`text-base w-1/2 font-semibold px-6 py-3 rounded-2xl ${
              !amount || parseFloat(amount) === 0
                ? 'bg-white/10 text-[#8B8BA0] cursor-not-allowed opacity-70'
                : 'bg-[#5F46F9] text-white hover:opacity-90 cursor-pointer'
            }`}
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
            Withdrawal
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default WithdrawModal
