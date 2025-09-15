'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Modal from '../common/Modal'
import Loading from '../common/Loading'
import usdcicon from '@/assets/images/usdc_icon.svg'
import depositusdcicon from '@/assets/images/depositusdc_icon.svg'
import menuClose from '@/assets/images/close_icon.svg'
import DropDown from '@/assets/images/tabler_chevron-down.svg'

type Props = {
  enableModal: boolean
  handleEnableTrading: () => void
  setTradingEnabled: (value: boolean) => void
}

function EnableTrading({ enableModal, handleEnableTrading, setTradingEnabled }: Props) {
  const [amount, setAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCloseModal = () => {
    handleEnableTrading()
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^[0-9]*[.,]?[0-9]*$/.test(value) || value === '') {
      setAmount(value)
    }
  }

  const onDepositClick = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setTradingEnabled(true)
      handleEnableTrading()
    }, 3000)
  }

  return (
    <Modal isOpen={enableModal} onClose={handleCloseModal}>
      <div
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
        className="w-full max-w-md max-md:max-w-sm border-[2px] bg-[#0F0816] p-6 rounded-2xl shadow-lg 
        relative lg:static max-lg:fixed max-lg:bottom-4 max-lg:left-1/2 max-lg:-translate-x-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {isLoading ? (
            <div />
          ) : (
            <h2 className="text-white font-semibold text-lg">Enable Trading</h2>
          )}{' '}
          <button
            onClick={handleCloseModal}
            className="p-2 bg-[#322944] rounded-full text-white/50 hover:text-white"
          >
            <Image src={menuClose} alt="close" width={13} height={13} />
          </button>
        </div>
        {isLoading ? (
          <Loading
            title={'Sign Transactions'}
            subTitle={'You will need to sign this transaction in your wallet:'}
            className="pt-[1rem] pb-[1rem] px-[4.5rem]"
          />
        ) : (
          <>
            <div className="border-2 border-white/10 rounded-md bg-[#FFFFFF0F] px-4 py-3 text-white text-sm mb-6 flex items-center justify-between">
              <span className="text-[#8B8BA0] text-sm font-medium">Deposit Cain</span>
              <span className="text-white tracking-normal flex items-center gap-x-1 text-sm font-medium">
                Arbitrum{' '}
                <Image
                  src={DropDown}
                  style={{ width: 26, height: 'auto' }}
                  className="pl-1"
                  alt=""
                />
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 mb-6">
              <Image
                src={depositusdcicon}
                alt="depositusdc"
                style={{ width: 40, height: 'auto' }}
              />
              <p className="text-white tracking-normal font-medium">Deposit USDC from Arbitrum</p>
            </div>
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex justify-between font-medium text-sm text-[#8B8BA0]">
                <span>Amount</span>
                <span>Available to deposit: 29,569.31 USDC</span>
              </div>

              <div className="relative flex justify-between items-center pr-4 pt-1 border-b border-white/10 pb-3">
                <input
                  type="text"
                  placeholder="00,000.00"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full rounded-md placeholder:text-[#8B8BA0] py-1 focus:outline-none text-base font-semibold placeholder:opacity-70 text-white pr-28"
                />
                <div className="flex">
                  <button className="text-sm font-medium p-[8px] text-white bg-white/10 rounded-lg">
                    MAX
                  </button>
                  <span className="ml-3 text-white flex items-center text-sm font-medium">
                    <Image
                      src={usdcicon}
                      style={{ width: 30, height: 'auto' }}
                      className="pr-2"
                      alt="usdcicon"
                    />
                    USDC
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-x-2 justify-between mt-6">
              <button
                onClick={handleCloseModal}
                className="text-[#8B8BA0] cursor-pointer w-1/2 text-base font-medium hover:text-white"
              >
                Cancel
              </button>
              <button
                disabled={!amount || parseFloat(amount) === 0}
                onClick={onDepositClick}
                className={`text-base w-1/2 font-semibold px-6 py-3 rounded-2xl ${
                  !amount || parseFloat(amount) === 0
                    ? 'bg-white/10 text-[#8B8BA0] cursor-not-allowed opacity-70'
                    : 'bg-[#5F46F9] text-white hover:opacity-90 cursor-pointer'
                }`}
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
            className="border-2 border-white/10 rounded-2xl px-4 py-4 text-white text-sm mb-6 flex items-center justify-between"
          >
            <span className="text-white text-sm font-medium">Deposit USDC to Nexon</span>
            <span className="text-white/50 opacity-50 tracking-normal flex items-center gap-x-1 text-sm font-medium">
              Not Signed
            </span>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default EnableTrading
