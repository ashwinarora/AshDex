import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { erc20Abi } from 'viem'
import { ChevronDown, X } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/context/ToastContext'
import { HYPERLIQUID_DEPOSIT, USDC_ARBITRUM } from '@/utils/constants'
import { useERC20Data } from '@/hooks/useERC20Data'
import { toHumanNumber, toRealNumber } from '@/utils/utils'
import Loading from '../common/Loading'
import Modal from '../common/Modal'
import CheckBox from '../common/CheckBox'
import arbitrum from '@/assets/images/arbitrum.svg'
import usdcicon from '@/assets/images/usdc_icon.svg'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { address } = useAccount()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [stayConnected, setStayConnected] = useState(true)
  const [hasConnected, setHasConnected] = useState(false)
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
  const handleCloseModal = () => {
    onClose()
  }

  const onEstablishConnection = async () => {
    setHasConnected(!hasConnected)
  }

  const onDepositClick = async () => {
    if (!usdc) return
    try {
      setIsLoading(true)
      await writeContract({
        address: usdc.address,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [HYPERLIQUID_DEPOSIT, amount]
      })
      setIsLoading(false)
      handleCloseModal()
      showToast(
        'success',
        'Deposit confirmed. Balance will update on the next block.',
        `<span className="text-[#2FA766]">Arbiscan Link</span>`
      )
    } catch (error) {
      console.error('Deposit error:', error)
    }
  }
  const renderCloseButton = () => (
    <button
      onClick={handleCloseModal}
      className="p-2 bg-white/10 rounded-full text-[#E8E0F1] hover:text-white"
    >
      <X className="w-5 h-5" />
    </button>
  )

  const renderConnectionPrompt = () => (
    <div>
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col items-start">
          <p className="text-lg text-white font-semibold">Establish Connection</p>
          <p className="text-[#8B8BA0] text-sm mt-1 font-normal mb-3">
            This signature is gas-free. It opens a decentralized channel for instant and gasless
            deposits.
          </p>
        </div>
        {renderCloseButton()}
      </div>
      <div className="flex items-center gap-x-1">
        <CheckBox label="" isChecked={stayConnected} setIsChecked={setStayConnected} />
        <span className="text-sm font-normal text-[#E8E0F1]">Stay Connected</span>
      </div>

      <button
        className="w-full mt-6 text-white cursor-pointer text-base font-semibold bg-[#5F46F9] hover:opacity-90 rounded-2xl px-6 py-3"
        onClick={onEstablishConnection}
      >
        Establish Connection
      </button>
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal}>
      <div
        className="w-full max-w-md max-md:max-w-sm border-white/10 border-[2px] bg-[#0F0816] max-md:p-3 p-6 rounded-2xl shadow-lg 
          relative lg:static max-lg:fixed max-lg:bottom-4 max-lg:left-1/2 max-lg:-translate-x-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        {!hasConnected ? (
          renderConnectionPrompt()
        ) : (
          <>
            {' '}
            <div className="flex items-start justify-between max-md:mb-0 mb-4 w-full">
              {isLoading ? (
                <div />
              ) : (
                <p className="text-lg text-[#FFFFFF] font-semibold tracking-[0em]">
                  Deposit to Nexon
                </p>
              )}
              {renderCloseButton()}
            </div>
            {isLoading ? (
              <Loading
                title={'Deposit in progress…'}
                subTitle={'You will need to sign this transaction in your wallet:'}
                className="py-[1rem] px-[1rem]"
              />
            ) : (
              <>
                {' '}
                <div className="border-2 max-md:mt-4 border-white/10 rounded-md bg-[#FFFFFF0F] pl-4 py-3 text-white text-sm mb-6 flex items-center justify-between">
                  <span className="text-[#8B8BA0] text-sm font-medium">Deposit Cain</span>
                  <div className="relative w-1/4 text-white tracking-normal flex items-center gap-x-1 text-sm font-medium">
                    <select id="chain" className="appearance-none focus:outline-none">
                      <option value="ethereum">Arbitrum</option>
                    </select>
                    <ChevronDown className="absolute w-5 h-5 right-1 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-y-2 mb-6">
                  <Image src={arbitrum} alt="test" width={50} height={50} />
                  <p className="text-white tracking-normal font-medium">
                    Deposit USDC from Arbitrum
                  </p>
                </div>
                <div className="mb-4">
                  <div className="flex mb-2 justify-between font-medium text-sm text-[#8B8BA0]">
                    <div>Amount</div>
                    <div>
                      Available to deposit: {toHumanNumber(balance, usdc?.decimals, 2)}{' '}
                      {usdc?.symbol}
                    </div>
                  </div>
                  <div className="relative flex justify-between items-center pr-4 pt-1 border-b border-white/10 pb-3">
                    <input
                      type="text"
                      id="amount"
                      value={toHumanNumber(amount, usdc?.decimals, 2) || ''}
                      onChange={(e) => setAmount(toRealNumber(e.target.value, usdc?.decimals))}
                      className="w-full rounded-md placeholder:text-[#8B8BA0] py-1 focus:outline-none text-base font-semibold placeholder:opacity-70 text-white pr-28"
                      placeholder="00,000.00"
                    />
                    <div className="flex items-center gap-x-2">
                      <button
                        onClick={() => setAmount(balance ?? 0n)}
                        className="text-sm font-medium p-[8px] text-white bg-white/10 rounded-lg"
                      >
                        Max
                      </button>
                      <span className="text-white flex items-center text-sm font-normal">
                        <Image
                          src={usdcicon}
                          width={30}
                          height={30}
                          className="pr-2"
                          alt="usdcicon"
                        />
                        USDC
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-x-2 justify-between mt-5">
                  <button
                    onClick={handleCloseModal}
                    className="text-[#8B8BA0] cursor-pointer w-1/2 text-base font-medium hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!amount || parseFloat(amount.toString()) === 0}
                    className={`text-base w-1/2 font-semibold px-6 py-3 rounded-2xl ${
                      !amount || parseFloat(amount.toString()) === 0
                        ? 'bg-white/10 text-[#8B8BA0] cursor-not-allowed opacity-70'
                        : 'bg-[#5F46F9] text-white hover:opacity-90 cursor-pointer'
                    }`}
                    onClick={onDepositClick}
                  >
                    Deposit
                  </button>
                </div>
              </>
            )}
            {isLoading && (
              <div
                style={{
                  background:
                    'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
                }}
                className="border-2 border-white/10 rounded-2xl px-4 py-4 text-white text-sm flex items-center justify-between"
              >
                <span className="text-[#FFFFFF] text-sm font-medium">Deposit USDC to Nexon</span>
                <span className="text-[#E8E0F1] opacity-50 tracking-normal flex items-center gap-x-1 text-sm font-medium">
                  Not Signed
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}
export default DepositModal
