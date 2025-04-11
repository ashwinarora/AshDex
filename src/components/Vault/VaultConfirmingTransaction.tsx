import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Modal from '../common/Modal'
import VaultSuccessHistory from './VaultSuccessHistory'
import menuClose from '@/assets/images/close_icon.svg'
import erroryellowicon from '@/assets/images/errorYellow_icon.svg'
import successicon from '@/assets/images/success_icon.svg'

interface VaultConfirmingTransactionProps {
  activeTab: 'Deposit' | 'Withdraw'
  setActiveTab: (tab: 'Deposit' | 'Withdraw') => void
  isConfirmingOpen: boolean
  openConfirmingModal: () => void
}

const VaultConfirmingTransaction: React.FC<VaultConfirmingTransactionProps> = ({
  activeTab,
  isConfirmingOpen,
  openConfirmingModal
}) => {
  const [step, setStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isFinalSuccess, setIsFinalSuccess] = useState(false)

  const handleCloseModal = () => {
    openConfirmingModal()
  }

  useEffect(() => {
    let timer1: NodeJS.Timeout
    let timer2: NodeJS.Timeout
    let timer3: NodeJS.Timeout
    if (isConfirmingOpen) {
      setShowSuccess(false)
      setStep(1)
      timer1 = setTimeout(() => {
        setStep(2)
        timer2 = setTimeout(() => {
          setStep(3)
          timer3 = setTimeout(() => {
            setIsFinalSuccess(true)
            setShowSuccess(true)
          }, 2000)
        }, 3000)
      }, 3000)
    }
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [isConfirmingOpen])

  return (
    <Modal isOpen={isConfirmingOpen} onClose={handleCloseModal}>
      <div
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
        className="w-full max-w-md max-md:max-w-sm border-[2px] bg-[#0F0816] p-6 rounded-2xl shadow-lg 
        relative lg:static max-lg:fixed max-lg:bottom-4 max-lg:left-1/2 max-lg:-translate-x-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        {showSuccess ? (
          <VaultSuccessHistory isFinalSuccess={isFinalSuccess} onClose={handleCloseModal} />
        ) : (
          <>
            {/* Full-Width Header */}
            <div className="flex items-center justify-between mb-4 w-full">
              <p className="text-lg text-[#FFFFFF] font-semibold tracking-[0em]">
                Confirming the Transaction
              </p>
              <button
                onClick={handleCloseModal}
                className="p-2 bg-[#322944] rounded-3xl text-[#E8E0F1] hover:text-white cursor-pointer"
              >
                <Image
                  height={20}
                  width={20}
                  src={menuClose}
                  alt="menuclose"
                  className="w-[13px] h-[13px]"
                />
              </button>
            </div>

            {step < 3 && (
              <div
                className={`rounded-lg p-4 flex items-center gap-y-1 gap-x-3 mb-6 ${
                  step >= 2 ? 'bg-white/10' : 'bg-[#FFA90A14]'
                }`}
              >
                <Image
                  src={erroryellowicon}
                  alt="warning"
                  width={25}
                  height={25}
                  className={step >= 2 ? 'filter grayscale brightness-200 opacity-60' : ''}
                />
                <div>
                  <p
                    className={`font-semibold text-base mb-1 ${
                      step >= 2 ? 'text-[#8B8BA0]' : 'text-[#FFA90A]'
                    }`}
                  >
                    Approve transaction in your wallet
                  </p>
                  <p
                    className={`font-normal text-xs ${
                      step >= 2 ? 'text-[#8B8BA0]' : 'text-[#FFA90A]'
                    }`}
                  >
                    Please Approve Transaction from connected wallet.
                  </p>
                </div>
              </div>
            )}

            {/* Stepper UI */}
            <div className="flex items-center justify-between w-full px-4 relative">
              {/* Step 1 */}
              <div className="flex flex-col items-center relative">
                <div className="absolute -right-12 min-[770px]:-right-18 top-2.5 w-[80%] min-[770px]:w-full border-t border-[#FFFFFF29]" />
                <Image height={20} width={20} src={successicon} alt="successicon" />
                <p className="text-sm text-[#2FA766] mt-2 font-semibold">Pending {activeTab}</p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center relative">
                <div className="absolute -right-10 min-[770px]:-right-16 top-2.5 w-[80%] min-[770px]:w-full border-t border-[#FFFFFF29]" />
                {step >= 2 ? (
                  <Image height={20} width={20} src={successicon} alt="successicon" />
                ) : (
                  <div className="bg-white/10 border font-medium border-white/10 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs z-10">
                    02
                  </div>
                )}
                <p
                  className={`text-sm ${
                    step >= 2 ? 'text-[#2FA766]' : 'text-[#8B8BA0]'
                  }  mt-2 font-semibold`}
                >
                  Confirming
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center relative">
                {step >= 3 ? (
                  <Image height={20} width={20} src={successicon} alt="successicon" />
                ) : (
                  <div className="bg-white/10 border font-medium border-white/10 text-[#8B8BA0] w-6 h-6 flex items-center justify-center rounded-full text-xs">
                    03
                  </div>
                )}
                <p
                  className={`text-sm ${
                    step >= 3 ? 'text-[#2FA766]' : 'text-[#8B8BA0]'
                  }  mt-2 font-semibold`}
                >
                  Sending
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default VaultConfirmingTransaction
