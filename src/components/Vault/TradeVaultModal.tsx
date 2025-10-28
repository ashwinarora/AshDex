import React from 'react'
import Image from 'next/image'
import Modal from '../common/Modal'
import erroryellowicon from '@/assets/images/errorYellow_icon.svg'
import menuClose from '@/assets/images/close_icon.svg'

interface TradeVaultModalProps {
  isVaultModal: boolean
  openVaultsModal: () => void
}

const TradeVaultModal: React.FC<TradeVaultModalProps> = ({ isVaultModal, openVaultsModal }) => {
  const handleCloseModal = () => {
    openVaultsModal()
  }
  return (
    <Modal isOpen={isVaultModal} onClose={handleCloseModal}>
      <div
        className="w-full max-w-md max-md:max-w-sm border-white/10 border-[2px] bg-[#0F0816] p-6 rounded-2xl shadow-lg 
    relative lg:static max-lg:fixed max-lg:bottom-4 max-lg:left-1/2 max-lg:-translate-x-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 w-full">
          <div />
          <button
            onClick={handleCloseModal}
            className="p-2 bg-[#322944] rounded-3xl text-white/70 hover:text-white cursor-pointer"
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
        <div className="flex flex-col items-center text-center">
          <div className="w-[48px] h-[48px] mb-4">
            <Image src={erroryellowicon} alt="Error Icon" style={{ width: 48, height: 'auto' }} />
          </div>
          <h2 className="text-white text-base font-medium mb-1 tracking-normal">
            Trading for a Vault works as a separate account with managed funds.{' '}
          </h2>
          <p className="text-[#8B8BA0] font-normal text-sm mb-5">
            You can place trades, but cannot withdraw or transfer funds.
          </p>
          <button
            onClick={handleCloseModal}
            className="w-full px-[11px] justify-center  flex items-center py-[11px] bg-[#5F46F9] font-bold text-white text-sm rounded-lg md:rounded-xl cursor-pointer"
          >
            Ok
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default TradeVaultModal
