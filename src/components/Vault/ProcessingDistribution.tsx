import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import vaultsDetailsData from '@/utils/VaultDetails.json'
import Modal from '../common/Modal'
import SuccessAndErrorModal from '../common/SuccessAndErrorModal'
import menuClose from '@/assets/images/close_icon.svg'
import successicon from '@/assets/images/success_icon.svg'

interface ProcessingDistributionProps {
  isVaultModal: boolean
  openVaultsModal: () => void
  viewVault: () => void
}

const ProcessingDistribution: React.FC<ProcessingDistributionProps> = ({
  isVaultModal,
  openVaultsModal,
  viewVault
}) => {
  const { distributeSuccessDetails } = vaultsDetailsData
  const [step, setStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [statusType, setStatusType] = useState<'success' | 'error'>()

  const handleUndoDistribution = () => {
    openVaultsModal()
  }

  const handleGoBack = () => {
    viewVault()
    openVaultsModal()
  }

  const renderSuccessDetails = () => {
    return (
      <>
        <div
          style={{
            background:
              'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
          }}
          className="border w-full space-y-3 border-white/10 mb-6 rounded-2xl p-4"
        >
          {distributeSuccessDetails?.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-[#E8E0F1] opacity-50 text-sm font-normal">{item?.label}:</span>
              <span className="text-white text-sm font-medium flex items-center gap-x-2">
                {item?.value}
              </span>
            </div>
          ))}
        </div>
        <button
          className="w-full p-2.5 justify-center flex items-center bg-[#5F46F9] font-bold text-white text-sm rounded-lg md:rounded-xl cursor-pointer"
          onClick={handleGoBack}
        >
          View Vault
        </button>
      </>
    )
  }

  useEffect(() => {
    let timer1: NodeJS.Timeout
    let timer2: NodeJS.Timeout
    let timer3: NodeJS.Timeout
    if (isVaultModal) {
      setShowSuccess(false)
      setStep(1)
      timer1 = setTimeout(() => {
        setStep(2)
        timer2 = setTimeout(() => {
          setStep(3)
          timer3 = setTimeout(() => {
            setStatusType('success')
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
  }, [isVaultModal])

  return (
    <>
      {' '}
      <Modal isOpen={isVaultModal} onClose={openVaultsModal}>
        <div
          className="w-full max-w-md max-md:max-w-sm border-white/10 border-[2px] bg-[#0F0816] max-md:p-3 p-6 rounded-2xl shadow-lg 
         relative lg:static max-lg:fixed max-lg:bottom-4 max-lg:left-1/2 max-lg:-translate-x-1/2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between w-full">
            <p className="text-lg text-white font-semibold tracking-[0em]">
              {'Processing Distribution…'}
            </p>
            <button
              onClick={openVaultsModal}
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
          {/* Stepper UI */}
          <div className="flex my-6 w-full items-center justify-between  px-4 relative">
            {/* Step 1 */}
            <div className="flex w-1/4 flex-col items-center relative">
              <div className="absolute -right-14 min-lg:-right-18 top-2.5 w-full border-t border-[#FFFFFF29]" />
              <Image height={20} width={20} src={successicon} alt="successicon" />
              <p className="text-sm text-[#2FA766] mt-2 font-semibold">Pending</p>
            </div>

            {/* Step 2 */}
            <div className="flex w-1/4 flex-col items-center relative">
              <div className="absolute -right-14 min-lg:-right-18 top-2.5 w-full border-t border-[#FFFFFF29]" />
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
                Distributed
              </p>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button
              className="text-[#8B8BA0] cursor-pointer w-1/2 text-sm font-medium hover:text-white"
              onClick={handleUndoDistribution}
            >
              {'Undo Distribution'}
            </button>
          </div>
        </div>
      </Modal>
      <SuccessAndErrorModal
        isOpen={showSuccess}
        onClose={handleGoBack}
        statusType={statusType}
        title={statusType === 'success' ? '00h 00m 04s' : 'Transaction Failed'}
        description={
          statusType === 'success'
            ? 'Profit distribution successfully completed!'
            : 'Insufficient funds in vault.'
        }
        buttonLabel="Go Back"
        onButtonClick={handleGoBack}
        renderSuccessDetails={renderSuccessDetails}
        type="distribution"
      />
    </>
  )
}

export default ProcessingDistribution
