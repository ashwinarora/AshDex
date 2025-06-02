import React, { useState } from 'react'
import Image from 'next/image'
import { useAccount, useSignTypedData } from 'wagmi'
import { getUsdClassTransferPayload } from '@/utils/hyperliquid/UsdClassTransfer'
import { splitSignature } from '@/utils/utils'
import arrowsorticon from '@/assets/images/arrowsort_icon.svg'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { hyperliquidAxios } from '@/config/axios'
import { isTestnet } from '@/utils/constants'
import SmallModal from '../../../common/SmallModal'

interface ITransferModal {
  isOpen: boolean
  onClose: () => void
}

const TransferModal = ({ isOpen, onClose }: ITransferModal) => {
  const { chainId } = useAccount()
  const [amount, setAmount] = useState<string>('')
  const [toPerp, setToPerp] = useState(false)
  const { clearingHouseState, spotState } = useHyperliquid()
  const { signTypedDataAsync } = useSignTypedData()

  const getBalance = () => {
    if (toPerp) {
      return (
        spotState?.balances?.find((balance) => balance.coin === 'USDC')?.total.toString() ?? '0'
      )
    } else {
      return clearingHouseState?.withdrawable.toString() ?? '0'
    }
  }

  return (
    <SmallModal isOpen={isOpen} onClose={onClose} heading="Transfer between Perp and Spot">
      <div className="flex items-center justify-between">
        <div
          className={`flex-1 border-2 border-white/10 bg-gradient-to-b from-white/5 to-gray-500/5 px-4 py-3 rounded-xl text-left`}
        >
          {toPerp ? 'Spot' : 'Perp'}
        </div>
        <button className="mx-4 cursor-pointer" onClick={() => setToPerp((prev) => !prev)}>
          <Image src={arrowsorticon} alt="Swap" style={{ width: 17, height: 'auto' }} />
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
    </SmallModal>
  )
}

export default TransferModal
