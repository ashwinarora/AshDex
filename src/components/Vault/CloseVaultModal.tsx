import React, { useState } from 'react'
import Image from 'next/image'
import vaultsDetailsData from '@/utils/VaultDetails.json'
import Modal from '../common/Modal'
import SuccessAndErrorModal from '../common/SuccessAndErrorModal'
import erroryellowicon from '@/assets/images/errorYellow_icon.svg'
import menuClose from '@/assets/images/close_icon.svg'

interface DisableDepositsVaultModalProps {
  isVaultModal: boolean
  openVaultsModal: () => void
}

const CloseVaultModal: React.FC<DisableDepositsVaultModalProps> = ({
  isVaultModal,
  openVaultsModal
}) => {
  const { closeVaultDetails } = vaultsDetailsData
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusType, setStatusType] = useState<'success' | 'error'>()
  const handleCloseModal = () => {
    openVaultsModal()
  }

  const handleCloseVault = () => {
    setStatusType('success')
    setIsModalOpen(true)
    setTimeout(() => {
      setIsModalOpen(false)
      openVaultsModal()
    }, 3000)
  }

  const handleGoToVaults = () => {
    setIsModalOpen(false)
    openVaultsModal()
  }

  return (
    <>
      <Modal isOpen={isVaultModal} onClose={handleCloseModal}>
        <div
          className="w-full max-w-md max-md:max-w-sm border-white/10 border-[2px] bg-[#0F0816] max-md:py-3 max-md:px-2 p-6 rounded-2xl shadow-lg 
           relative lg:static max-lg:fixed max-lg:bottom-4 max-lg:left-1/2 max-lg:-translate-x-1/2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 w-full">
            <p className="text-lg text-white font-semibold tracking-[0em]"> {'Close Vault'}</p>{' '}
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
          <div
            className={`rounded-lg py-4 px-3 flex items-center gap-y-1 gap-x-3 mb-6 ${'bg-[#FFA90A14]'}`}
          >
            <Image src={erroryellowicon} alt="warning" style={{ width: 25, height: 'auto' }} />
            <p className={`font-normal text-sm ${'text-[#FFA90A]'}`}>
              {'Closing Vault is irreversible. Make sure all users have withdrawn their funds.'}
            </p>
          </div>
          <div
            style={{
              background:
                'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
            }}
            className="border border-white/10 mt-6 rounded-2xl max-md:px-2.5 p-4 space-y-3"
          >
            {closeVaultDetails?.map((item, index) => (
              <div key={index} className="flex justify-between gap-x-2 items-center text-sm">
                <span className="text-[#E8E0F1] opacity-50 text-sm font-normal">
                  {item?.label}:
                </span>
                <span className="text-white text-sm font-medium flex items-center ">
                  {item?.value}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between gap-x-2 mt-6">
            <button
              className="text-[#8B8BA0] w-1/2 text-base font-medium hover:text-white"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              onClick={handleCloseVault}
              className=" w-1/2  px-[11px] justify-center  flex items-center py-[11px] bg-[#5F46F9] font-bold text-white text-sm rounded-lg md:rounded-xl cursor-pointer"
            >
              <span>Close Vault</span>
            </button>
          </div>
        </div>
      </Modal>
      <SuccessAndErrorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        statusType={statusType}
        title={statusType === 'success' ? 'Vault Closed Successfully!' : 'Vault Closure Failed!'}
        description={
          statusType === 'success'
            ? 'All funds have been distributed, and the vault is now inactive.'
            : 'Some users still have active deposits.'
        }
        buttonLabel="Go to Vaults"
        onButtonClick={handleGoToVaults}
      />
    </>
  )
}

export default CloseVaultModal
