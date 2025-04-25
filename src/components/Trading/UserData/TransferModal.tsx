import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import Image from 'next/image'
import { X } from 'lucide-react'
import { useAccount, useSignTypedData } from 'wagmi'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { getUsdClassTransferPayload } from '@/utils/hyperliquid/UsdClassTransfer'
import { splitSignature } from '@/utils/utils'
import arrowsorticon from '@/assets/images/arrowsort_icon.svg'

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
      <div
        className="w-full max-w-md max-md:max-w-sm border-white/10 border-[2px] bg-[#0F0816] max-md:p-3 p-6 rounded-2xl shadow-lg 
          relative lg:static max-lg:fixed max-lg:bottom-4 max-lg:left-1/2 max-lg:-translate-x-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 w-full">
          <p className="text-lg text-[#FFFFFF] font-medium tracking-[0em]">
            Transfer between Perp and Spot
          </p>
          <button
            className="p-2 bg-[#322944] rounded-3xl text-[#E8E0F1] hover:text-white cursor-pointer"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div
            className={`flex-1 border-2 border-white/10 bg-gradient-to-b from-white/5 to-gray-500/5 px-4 py-3 rounded-xl text-left`}
          >
            {toPerp ? 'Spot' : 'Perp'}
          </div>
          <button className="mx-4 cursor-pointer" onClick={() => setToPerp((prev) => !prev)}>
            <Image src={arrowsorticon} alt="Swap" width={17} height={17} />
          </button>
          <div className="flex-1 border-2 border-white/10 bg-gradient-to-b from-white/5 to-gray-500/5 px-4 py-3 rounded-xl text-left">
            {!toPerp ? 'Spot' : 'Perp'}
          </div>
        </div>
        <div className="my-4">
          <div className="flex mb-2 justify-between font-medium text-sm text-[#8B8BA0]">
            <div>Amount</div>
            <div>Balance: {getBalance()} USDC</div>
          </div>
          <div className="flex items-center border-2 border-white/10 bg-gradient-to-b from-white/5 to-gray-500/5 px-3 py-2 rounded-lg mb-3">
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent text-white placeholder-[#8B8BA0] text-lg w-full outline-none"
              placeholder="0.00"
            />
            <div className="flex items-center gap-x-2">
              <button
                onClick={() => setAmount(getBalance())}
                className="text-[#8B8BA0] border py-1 px-2 border-white/10 bg-[#FFFFFF0F] text-sm font-medium rounded-lg"
              >
                Max
              </button>
              <span className="text-[#8B8BA0] text-sm font-medium">USDC</span>
            </div>
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
            className="w-full bg-primary cursor-pointer text-[#FFFFFF] py-3 rounded-xl text-base font-semibold"
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
