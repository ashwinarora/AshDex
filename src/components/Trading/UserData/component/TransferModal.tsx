import { useState } from 'react'
import { useAccount, useSignTypedData } from 'wagmi'
import { getUsdClassTransferPayload } from '@/utils/hyperliquid/UsdClassTransfer'
import { splitSignature } from '@/utils/utils'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { hyperliquidAxios } from '@/config/axios'
import { isTestnet } from '@/utils/constants'
import SmallModal from '../../../common/SmallModal'
import { toast } from 'react-toastify'
import { IconTransfer } from '@tabler/icons-react'

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
      <div className="flex justify-between items-center">
        <div
          className={`flex-1 border-2 border-white/10 bg-gradient-to-b from-white/5 to-gray-500/5 px-4 py-3 rounded-xl text-left`}
        >
          {toPerp ? 'Spot' : 'Perp'}
        </div>
        <button className="mx-4 cursor-pointer" onClick={() => setToPerp((prev) => !prev)}>
          <IconTransfer className="w-4 h-4" />
        </button>
        <div className="flex-1 bg-gradient-to-b from-white/5 to-gray-500/5 px-4 py-3 border-2 border-white/10 rounded-xl text-left">
          {!toPerp ? 'Spot' : 'Perp'}
        </div>
      </div>
      <div className="my-4">
        <div className="flex justify-between mb-2 font-medium text-[#8B8BA0] text-sm">
          <div>Amount</div>
          <div>Balance: {getBalance()} USDC</div>
        </div>
        <div className="flex items-center bg-gradient-to-b from-white/5 to-gray-500/5 mb-3 px-3 py-2 border-2 border-white/10 rounded-lg">
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-transparent outline-none w-full text-white text-lg placeholder-[#8B8BA0]"
            placeholder="0.00"
          />
          <div className="flex items-center gap-x-2">
            <button
              onClick={() => setAmount(getBalance())}
              className="bg-[#FFFFFF0F] px-2 py-1 border border-white/10 rounded-lg font-medium text-[#8B8BA0] text-sm"
            >
              Max
            </button>
            <span className="font-medium text-[#8B8BA0] text-sm">USDC</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <button
          onClick={async () => {
            if (!chainId) return
            const toastId = toast.loading('Transferring...')
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
              toast.update(toastId, {
                render: 'Transfer successful',
                type: 'success',
                isLoading: false,
                autoClose: 3000
              })
              onClose()
            } catch (error) {
              console.error('Transfer failed:', error)
              toast.update(toastId, {
                render: 'Transfer failed',
                type: 'error',
                isLoading: false,
                autoClose: 3000
              })
            }
          }}
          className="bg-primary py-3 rounded-xl w-full font-semibold text-[#FFFFFF] text-base cursor-pointer"
        >
          Transfer to {toPerp ? 'Perp' : 'Spot'}
        </button>
      </div>
    </SmallModal>
  )
}

export default TransferModal
