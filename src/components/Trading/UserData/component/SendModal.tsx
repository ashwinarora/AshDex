import React, { useMemo, useState } from 'react'
import SmallModal from '../../../common/SmallModal'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { toast } from 'react-toastify'
import { getUsdSendPayload } from '@/utils/hyperliquid/UsdSend'
import { isTestnet } from '@/utils/constants'
import { hyperliquidAxios } from '@/config/axios'
import { splitSignature } from '@/utils/utils'
import { useAccount, useSignTypedData } from 'wagmi'
import { getSpotSendPayload } from '@/utils/hyperliquid/SpotSend'
import { useSpotMeta } from '@/hooks/useSpotMeta'

interface SendModalProps {
  isOpen: boolean
  onClose: () => void
  spotDefaultName?: string
}

const SendModal: React.FC<SendModalProps> = ({ isOpen, onClose, spotDefaultName }) => {
  const [destination, setDestination] = useState('')
  const [isPerp, setIsPerp] = useState(spotDefaultName ? false : true)
  const [selectedToken, setSelectedToken] = useState(spotDefaultName || 'USDC')
  const [amount, setAmount] = useState('')
  const { chainId } = useAccount()
  const { clearingHouseState, spotState } = useHyperliquid()
  const { signTypedDataAsync } = useSignTypedData()
  const { data: spotMeta } = useSpotMeta()

  const spotData = useMemo(() => {
    // HACK: SpotMeta has USDC-SPOT, but spotState has USDC. So we need to use USDC-SPOT here.
    const tokenName = selectedToken === 'USDC' ? 'USDC-SPOT' : selectedToken
    const token = spotMeta?.tokens.find((t) => t.name === tokenName)
    if (!token) return null
    return {
      tokenName: token.name.split('-')[0],
      tokenId: token.tokenId
    }
  }, [spotMeta, selectedToken])

  const maxAmount = useMemo(() => {
    if (isPerp) {
      return clearingHouseState?.withdrawable || 0
    } else {
      const token = spotState?.balances.find((b) => b.coin === selectedToken)
      if (!token) return 0
      return token.total - token.hold
    }
  }, [isPerp, clearingHouseState, spotState, spotMeta, selectedToken])

  return (
    <SmallModal isOpen={isOpen} onClose={onClose} heading="Send Tokens">
      <div className="mb-4">
        <div className="text-left text-base text-[#E8E0F1] mb-2">
          Send tokens to another account on the Nexon.
        </div>
        <input
          className="w-full bg-[#322944] text-white rounded px-3 py-2 mb-4 placeholder-[#7A6FA7]"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Destination"
        />
        <div className="flex gap-2 mb-4">
          <select
            className="flex-1 bg-[#322944] text-white rounded px-3 py-2"
            value={isPerp ? 'Perps Account' : 'Spot Account'}
            onChange={(e) => setIsPerp(e.target.value === 'Perps Account')}
          >
            <option value="Perps Account">Perps Account</option>
            <option value="Spot Account">Spot Account</option>
          </select>
          <select
            className="flex-1 bg-[#322944] text-white rounded px-3 py-2"
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
          >
            {isPerp ? (
              <option value="USDC">USDC</option>
            ) : (
              spotState?.balances.map((token) => (
                <option key={token.coin} value={token.coin}>
                  {token.coin} ({(token.total - token.hold).toFixed(4)})
                </option>
              ))
            )}
          </select>
        </div>
        <div className="mb-6">
          <div className="flex justify-between text-xs text-[#E8E0F1] mb-1">
            <span>Amount</span>
            <button
              className="text-[#7A6FA7] cursor-pointer hover:text-[#E8E0F1]"
              onClick={() => setAmount(maxAmount.toString())}
            >
              MAX: {maxAmount.toFixed(4)} {selectedToken}
            </button>
          </div>
          <input
            className="w-full bg-[#322944] text-white rounded px-3 py-2 placeholder-[#7A6FA7]"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            type="number"
            min="0"
            max={maxAmount}
          />
        </div>
        <button
          className="w-full mt-2 py-2 bg-[#7A6FA7] text-white font-bold rounded-lg shadow-lg hover:bg-[#E8E0F1] hover:text-[#322944] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-[#7A6FA7] cursor-pointer"
          disabled={!destination || !amount || Number(amount) <= 0 || Number(amount) > maxAmount}
          onClick={async () => {
            if (!chainId) return
            const toastId = toast.loading('Sending...')
            if (isPerp) {
              try {
                const payload = getUsdSendPayload({
                  destination: destination,
                  amount: amount,
                  chainId: chainId,
                  isTestnet: isTestnet,
                  nonce: Date.now()
                })
                const sign = await signTypedDataAsync(payload)
                const body = {
                  action: payload.message,
                  nonce: payload.message.time,
                  signature: splitSignature(sign)
                }
                const res = await hyperliquidAxios.post('/exchange', body)
                if (res.data.status === 'err') {
                  toast.update(toastId, {
                    render: '❌' + res.data.response,
                    type: 'error',
                    isLoading: false,
                    autoClose: 4000
                  })
                  return
                }
                toast.update(toastId, {
                  render: '✅ Send successful',
                  type: 'success',
                  isLoading: false,
                  autoClose: 2000
                })
              } catch (error) {
                console.log(error)
                toast.update(toastId, {
                  render: '❌ Send failed',
                  type: 'error',
                  isLoading: false,
                  autoClose: 4000
                })
              }
            } else {
              if (!spotData) return
              try {
                const payload = getSpotSendPayload({
                  destination: destination,
                  amount: amount,
                  chainId: chainId,
                  isTestnet: isTestnet,
                  nonce: Date.now(),
                  tokenName: spotData.tokenName,
                  tokenId: spotData.tokenId
                })
                const sign = await signTypedDataAsync(payload)
                const body = {
                  action: payload.message,
                  nonce: payload.message.time,
                  signature: splitSignature(sign)
                }
                const res = await hyperliquidAxios.post('/exchange', body)
                if (res.data.status === 'err') {
                  toast.update(toastId, {
                    render: '❌' + res.data.response,
                    type: 'error',
                    isLoading: false,
                    autoClose: 4000
                  })
                  return
                }
                toast.update(toastId, {
                  render: '✅ Send successful',
                  type: 'success',
                  isLoading: false,
                  autoClose: 2000
                })
              } catch (error) {
                console.log(error)
                toast.update(toastId, {
                  render: '❌ Send failed',
                  type: 'error',
                  isLoading: false,
                  autoClose: 4000
                })
              }
            }
          }}
        >
          Send
        </button>
      </div>
    </SmallModal>
  )
}

export default SendModal
