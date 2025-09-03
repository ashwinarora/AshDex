import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import Modal from '../common/Modal'
import Switch from '../common/Switch'
import Loading from '../common/Loading'
import { LENDBORROW_LOADING_MESSAGES } from '@/utils/constants'
import lendBorrowData from '@/utils/lendBorrow.json'
import ethicon from '../../assets/images/eth_icon.svg'
import menuClose from '@/assets/images/close_icon.svg'
import Slider1 from '@/assets/images/slider_value.svg'
import { toast } from 'sonner'

interface WithdrawAndRepayModalProps {
  type: 'Withdraw' | 'Repay' | null
  setModalType: React.Dispatch<React.SetStateAction<'Withdraw' | 'Repay' | null>>
  isModalOpen: boolean
  openModal: () => void
}

type TypeName = 'Withdraw' | 'Repay'

const WithdrawAndRepayModal: React.FC<WithdrawAndRepayModalProps> = ({
  type,
  setModalType,
  isModalOpen,
  openModal
}) => {
  const { withdrawAndRepayData } = lendBorrowData?.lendBorrow
  const [amount, setAmount] = useState('0.00')
  const [isChecked, setIsChecked] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState(false)
  const [usdPercent, setUsdPercent] = useState(0)

  const handleUsdPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsdPercent = parseFloat(e.target.value) || 0
    setUsdPercent(newUsdPercent)
  }

  const handleCloseModal = () => {
    setAmount('0.00')
    setIsChecked(true)
    setModalType(null)
    setIsLoading(false)
    openModal()
  }

  const onHandleClick = (type: 'Withdraw' | 'Repay') => {
    setIsLoading(true)
    setTimeout(() => {
      handleCloseModal()
      setTimeout(() => {
        setIsLoading(false)
        toast.success(
          type === 'Withdraw' ? 'Funds successfully withdrawn!' : 'Funds successfully repaid!',
          {
            description:
              type === 'Withdraw'
                ? `You have withdrawn 3,000 USDC from the pool to your wallet.`
                : 'You have repaid 1,500 USDC. Remaining debt: 500 USDC.'
          }
        )
      }, 500)
    }, 2000)
  }

  const activeTypeData = useMemo(() => {
    return withdrawAndRepayData?.find((tab) => tab?.tab === type)
  }, [type])

  return (
    <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
      <div
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
        className="w-full border-[2px] bg-secondary max-w-md p-6 rounded-2xl shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full-Width Header */}
        <div className="flex items-center justify-between mb-4 w-full">
          <p className="text-lg text-white font-semibold tracking-[0em]">{type}</p>
          <button
            onClick={handleCloseModal}
            className="p-2 bg-[#322944] rounded-3xl text-white/50hover:text-white cursor-pointer"
          >
            <Image
              width={20}
              height={20}
              src={menuClose}
              alt="menuclose"
              className="w-[13px] h-[13px]"
            />
          </button>
        </div>
        <div className="bg-gradient-to-b from-white/5 to-gray-500/5 rounded-xl border border-white/10 backdrop-blur-[40px]">
          {isLoading ? (
            <Loading
              title={type ? LENDBORROW_LOADING_MESSAGES[type]?.title : ''}
              subTitle={type ? LENDBORROW_LOADING_MESSAGES[type]?.subtitle : ''}
              className="py-[6.15rem] px-[2rem]"
            />
          ) : (
            <>
              <div className="mb-3 mt-1 px-4 py-2">
                <label className="text-sm text-[#8B8BA0] font-medium">Amount</label>
                <div className="flex justify-between items-center pr-1 pt-1">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`rounded-md py-1 ${parseFloat(amount) > 100 ? 'text-red' : 'text-white'} focus:outline-none focus:none focus:none text-base font-semibold`}
                  />
                  <div className="flex">
                    <button className="text-sm font-medium p-[8px] text-white bg-white/10 rounded-lg">
                      MAX
                    </button>
                    <span className="ml-3 text-white flex items-center text-sm font-medium">
                      <Image
                        src={ethicon}
                        style={{ width: 30, height: 30 }}
                        className="pr-2"
                        alt="ethicon"
                      />
                      ETH
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-[#8B8BA0] mt-2">
                  {parseFloat(amount) > 100 ? (
                    <span className={`${parseFloat(amount) > 100 ? 'text-red' : ''}`}>
                      You can {type?.toLowerCase()} a maximum of 100 ETH.
                    </span>
                  ) : (
                    <span>
                      {type === 'Withdraw' ? 'Withdrawable' : 'Repayable'} amount:{' '}
                      <span className="text-white">0 ETH</span>
                    </span>
                  )}
                </p>
                {type === 'Repay' && (
                  <div className="mt-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={usdPercent}
                      onChange={handleUsdPercentChange}
                      className="cursor-pointer w-[80%] appearance-none h-2 rounded-lg outline-none"
                      style={{
                        background: `linear-gradient(to right, #702DF5 0%, #702DF5 ${usdPercent}%, #2A1B3D ${usdPercent}%, #2A1B3D 100%)`
                      }}
                    />
                    <div className="flex justify-between items-start">
                      <div className="w-5/6 mr-3">
                        <Image
                          src={Slider1}
                          alt="Slider1"
                          width={20}
                          height={20}
                          className="w-full mt-1"
                        />
                        <div className="text-xs text-gray-500 flex justify-between">
                          <span>0%</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-16 h-10 px-2 rounded-md border border-white/10 bg-white/10 outline-none text-left text-white"
                          value={usdPercent}
                          onChange={handleUsdPercentChange}
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex border-y p-4 border-white/10  items-center mb-3">
                <Switch label="" setIsChecked={setIsChecked} isChecked={isChecked} />
                <span className="text-sm text-white/50font-medium">Wrap ETH (to supply WETH)</span>
              </div>

              <div className="px-4 py-2">
                <button
                  onClick={() => {
                    onHandleClick(type as TypeName)
                  }}
                  disabled={
                    amount === '0.00' || amount === '0' || amount === '' || parseFloat(amount) > 100
                  }
                  className={
                    'py-[12px] px[24px] tracking-[0em] disabled:opacity-50 disabled:bg-white/10 disabled:text-[#8B8BA0] font-bold rounded-xl w-full text-base bg-primary text-white cursor-pointer'
                  }
                >
                  {type}
                </button>
              </div>

              <div className="p-4 text-sm mb-3 space-y-1">
                {activeTypeData && (
                  <>
                    <p className="flex justify-between ">
                      <span className="font-normal opacity-50 text-[#E8E0F1]">
                        {type === 'Withdraw' ? 'Supply' : 'Borrow'} balance (USDC)
                      </span>
                      <span className="text-white font-medium">{activeTypeData?.balance}</span>
                    </p>
                    <p className="flex justify-between pt-2">
                      <span className="font-normal opacity-50 text-[#E8E0F1]">
                        Borrow limit {type === 'Repay' && 'used'}
                      </span>
                      <span className="text-white font-medium">{activeTypeData?.limit}</span>
                    </p>
                    <p className="flex justify-between pt-2">
                      <span className="font-normal opacity-50 text-[#E8E0F1]">Daily earnings</span>
                      <span className="text-white font-medium">
                        {activeTypeData?.dailyearnings}
                      </span>
                    </p>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default WithdrawAndRepayModal
