import React, { useState } from 'react'
import SmallModal from '../../../common/SmallModal'

interface SendModalProps {
  isOpen: boolean
  onClose: () => void
  maxAmount: number
}

const SendModal: React.FC<SendModalProps> = ({ isOpen, onClose, maxAmount }) => {
  const [destination, setDestination] = useState('')
  const [accountType, setAccountType] = useState('Spot Account')
  const [token, setToken] = useState('USDC')
  const [amount, setAmount] = useState('')

  return (
    <SmallModal isOpen={isOpen} onClose={onClose} heading="Send Tokens">
      <div className="mb-4">
        <div className="text-center text-base text-[#E8E0F1] mb-2">
          Send tokens to another account on the Hyperliquid L1.
        </div>
        <input
          className="w-full bg-[#322944] text-white rounded px-3 py-2 mb-4 placeholder-[#7A6FA7]"
          value={destination}
          onChange={e => setDestination(e.target.value)}
          placeholder="Destination"
        />
        <div className="flex gap-2 mb-4">
          <select
            className="flex-1 bg-[#322944] text-white rounded px-3 py-2"
            value={accountType}
            onChange={e => setAccountType(e.target.value)}
          >
            <option value="Spot Account">Spot Account</option>
            {/* Add more account types if needed */}
          </select>
          <select
            className="flex-1 bg-[#322944] text-white rounded px-3 py-2"
            value={token}
            onChange={e => setToken(e.target.value)}
          >
            <option value="USDC">USDC</option>
            {/* Add more tokens if needed */}
          </select>
        </div>
        <div className="mb-6">
          <div className="flex justify-between text-xs text-[#E8E0F1] mb-1">
            <span>Amount</span>
            <span className="text-[#00E0CA] cursor-pointer" onClick={() => setAmount(maxAmount.toString())}>
              MAX: {maxAmount.toLocaleString()} {token}
            </span>
          </div>
          <input
            className="w-full bg-[#322944] text-white rounded px-3 py-2 placeholder-[#7A6FA7]"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Amount"
            type="number"
            min="0"
            max={maxAmount}
          />
        </div>
        <button
          className="w-full mt-2 py-2 bg-[#23404A] text-[#E8E0F1] font-semibold rounded-lg hover:bg-[#00bfae] hover:text-[#18122B] transition disabled:opacity-50"
          disabled={!destination || !amount || Number(amount) <= 0 || Number(amount) > maxAmount}
          onClick={() => {/* send logic here */}}
        >
          Send
        </button>
      </div>
    </SmallModal>
  )
}

export default SendModal
