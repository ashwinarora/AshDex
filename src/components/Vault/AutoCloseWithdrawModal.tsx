import React, { useState } from 'react'
import Image from 'next/image'
import vaultsDetailsData from '@/utils/VaultDetails.json'
import Modal from '../common/Modal'
import SuccessAndErrorModal from '../common/SuccessAndErrorModal'
import menuClose from '@/assets/images/close_icon.svg'
import erroryellowicon from '@/assets/images/errorYellow_icon.svg'
import Slider1 from '@/assets/images/slider_value.svg'

interface AutoCloseWithdrawModalProps {
  isVaultModal: boolean
  openVaultsModal: () => void
  isAutoCloseWithdraw: boolean
  setIsAutoCloseWithdraw: (value: boolean) => void
}

const AutoCloseWithdrawModal: React.FC<AutoCloseWithdrawModalProps> = ({
  isVaultModal,
  openVaultsModal,
  isAutoCloseWithdraw,
  setIsAutoCloseWithdraw
}) => {
  const { autoCloseWithdrawDetails } = vaultsDetailsData
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusType, setStatusType] = useState<'success' | 'error'>()
  const [usdPercent, setUsdPercent] = useState(0)

  const handleUsdPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsdPercent = parseFloat(e.target.value) || 0
    setUsdPercent(newUsdPercent)
  }

  const handleCloseModal = () => {
    setIsAutoCloseWithdraw(!isAutoCloseWithdraw)
    openVaultsModal()
  }

  const handleDisable = () => {
    setStatusType('success')
    setIsModalOpen(true)
    setTimeout(() => {
      setIsAutoCloseWithdraw(!isAutoCloseWithdraw)
      setIsModalOpen(false)
      openVaultsModal()
    }, 3000)
  }

  const handleGoBack = () => {
    setIsModalOpen(false)
    setIsAutoCloseWithdraw(!isAutoCloseWithdraw)
    openVaultsModal()
  }

  return (
    <>
      {' '}
      <Modal isOpen={isVaultModal} onClose={handleCloseModal}>
        <div
          className="w-full max-w-md max-md:max-w-sm border-white/10 border-[2px] bg-[#0F0816] max-md:p-3 p-6 rounded-2xl shadow-lg 
     relative lg:static max-lg:fixed max-lg:bottom-4 max-lg:left-1/2 max-lg:-translate-x-1/2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between max-md:mb-2 mb-4 w-full">
            <p className="flex flex-col">
              <span className="text-lg flex flex-col text-white font-semibold tracking-[0em]">
                {' '}
                {isAutoCloseWithdraw
                  ? 'Disable Auto-Close on Withdraw'
                  : 'Enable Auto-Close on Withdraw'}
              </span>{' '}
              <span className="text-white/50 opacity-40 mt-1 text-sm font-normal tracking-normal">
                {isAutoCloseWithdraw
                  ? 'Withdrawals may exceed the threshold, and the vault will remain open unless closed manually.'
                  : 'When enabled, the vault will automatically close when withdrawals exceed the set threshold.'}
              </span>
            </p>
            <button
              onClick={handleCloseModal}
              className="p-2 bg-[#322944] rounded-3xl text-white/50 hover:text-white cursor-pointer"
            >
              <Image
                src={menuClose}
                width={20}
                height={20}
                alt="menuclose"
                className="w-auto h-auto"
              />
            </button>
          </div>
          {isAutoCloseWithdraw && (
            <div
              className={`rounded-lg py-4 px-3 flex items-center gap-y-1 gap-x-3 mb-6 ${'bg-[#FFA90A14]'}`}
            >
              <Image src={erroryellowicon} alt="warning" style={{ width: 25, height: 'auto' }} />
              <p className={`font-normal text-sm ${'text-[#FFA90A]'}`}>
                {`If disabled, the vault will remain open even if withdrawals exceed the threshold. You will need to manually close it when necessary.`}
              </p>
            </div>
          )}
          <div
            style={{
              background:
                'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
            }}
            className="border border-white/10 max-md:mt-1 mt-6 rounded-2xl p-4 space-y-3"
          >
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/50 opacity-50 text-sm font-normal">
                Auto-Close Status:
              </span>
              <span
                className={`rounded-lg py-0.5 px-2 font-medium flex items-center gap-x-2 ${isAutoCloseWithdraw ? ' bg-[#1F1F30] text-green' : 'bg-[#FF3B3B1A] text-[#FF3B3B]'}`}
              >
                {isAutoCloseWithdraw ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {autoCloseWithdrawDetails?.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-white/50 opacity-50 text-sm font-normal">{item?.label}:</span>
                <span className="text-white text-sm font-medium flex items-center gap-x-2">
                  {item?.value}
                </span>
              </div>
            ))}
            {!isAutoCloseWithdraw && (
              <div
                style={{
                  background:
                    'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
                }}
                className="border-b py-3 mt-2 px-3.5 rounded-xl border-white/10"
              >
                <span className="text-[#8B8BA0] text-sm font-medium">Withdraw Threshold</span>
                <div className="my-2">
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
                        className="w-16 h-10 px-2 rounded-md border border-white/10 bg-white/10 outline-none text-start text-white"
                        value={usdPercent}
                        onChange={handleUsdPercentChange}
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[#8B8BA0] text-sm font-medium">
                  At 100%, the vault will close only when all funds are withdrawn.
                </span>
              </div>
            )}
          </div>
          {!isAutoCloseWithdraw && (
            <div className="pl-3.5 pr-2 rounded-lg py-3 mt-5 bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]">
              <span className="text-white text-sm font-normal">
                If enabled, the vault will close when total withdrawals exceed 90% ($45,000).
              </span>
            </div>
          )}
          <div className="flex justify-between gap-x-2 mt-6">
            <button
              className="text-[#8B8BA0] w-1/2 text-base font-medium hover:text-white"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              onClick={handleDisable}
              className=" w-1/2  px-[11px] justify-center  flex items-center py-[11px] bg-[#5F46F9] font-bold text-white text-sm rounded-lg md:rounded-xl cursor-pointer"
            >
              <span>{isAutoCloseWithdraw ? 'Disable Auto-Close' : 'Enable Auto-Close'}</span>
            </button>
          </div>
        </div>
      </Modal>
      <SuccessAndErrorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        statusType={statusType}
        title={statusType === 'success' ? 'Auto-Close Enabled!' : 'Failed to Enable Auto-Close!'}
        description={
          statusType === 'success'
            ? 'Vault will close automatically when withdrawals exceed 90% of liquidity.'
            : 'Minimum threshold for auto-close is 80%.'
        }
        buttonLabel="Go Back"
        onButtonClick={handleGoBack}
      />
    </>
  )
}

export default AutoCloseWithdrawModal
