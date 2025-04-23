import { useState } from 'react'
import Modal from '../common/Modal'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { ChevronDown, X } from 'lucide-react'
import arbitrum from '@/assets/images/arbitrum.svg'
import Image from 'next/image'
import { HYPERLIQUID_DEPOSIT, USDC_ARBITRUM } from '@/utils/constants'
import { erc20Abi } from 'viem'
import { useERC20Data } from '@/hooks/useERC20Data'
import { toHumanNumber, toRealNumber } from '@/utils/utils'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { address } = useAccount()
  const [amount, setAmount] = useState<bigint>(0n)
  const { data: usdc } = useERC20Data(USDC_ARBITRUM)
  const { data: balance } = useReadContract({
    address: USDC_ARBITRUM,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address || '0x'],
    query: {
      enabled: !!address
    }
  })
  const { writeContract } = useWriteContract()

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        className=" flex flex-col rounded-lg w-3/12 bg-secondary border border-gray-300 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Deposit on Nexon</h2>
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
        </div>
        <div className="mb-4">
          <label
            htmlFor="amount"
            className="text-sm font-medium text-gray-300 flex justify-between"
          >
            <div>Amount</div>
            <div>
              Balance: {toHumanNumber(balance, usdc?.decimals, 2)} {usdc?.symbol}
            </div>
          </label>
          <div className="relative mt-2">
            <input
              type="text"
              id="amount"
              value={toHumanNumber(amount, usdc?.decimals, 2) || ''}
              onChange={(e) => setAmount(toRealNumber(e.target.value, usdc?.decimals))}
              className="block w-full bg-gray-700 border border-gray-500 text-gray-300 rounded-lg py-2 px-3 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount"
            />
            <button
              onClick={() => setAmount(balance ?? 0n)}
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
              if (!usdc) return
              writeContract({
                address: usdc.address,
                abi: erc20Abi,
                functionName: 'transfer',
                args: [HYPERLIQUID_DEPOSIT, amount]
              })
            }}
          >
            Deposit
          </button>
        </div>
      </div>
    </Modal>
  )
}
export default DepositModal
