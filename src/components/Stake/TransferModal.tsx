import React from 'react'
import Image from 'next/image'
import Modal from '../common/Modal'
import menuClose from '@/assets/images/close_icon.svg'
import hyperliquidicon from '@/assets/images/hyperliquid_icon.svg'
import arrowsorticon from '@/assets/images/arrowsort_icon.svg'
import infoicon from '@/assets/images/info_icon.svg'

type TransferModalProps = {
  isOpen: boolean
  onClose: () => void
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const handleCloseModal = () => {
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal}>
      <div
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
        className="w-full border-[2px] bg-secondary max-w-lg p-6 rounded-2xl shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 w-full">
          <p className="text-lg text-white font-medium tracking-[0em]">{'Transfer HYPE'}</p>
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 border-2 border-white/10 bg-gradient-to-b from-white/5 to-gray-500/5 px-4 py-3 rounded-xl text-start">
            <p className="text-sm mb-1.5 font-medium text-[#8B8BA0]">From</p>
            <p className="text-base font-medium text-white">Staking Balance</p>
            <p className="text-xs text-[#8B8BA0] font-medium">
              Balance: <span className="text-white text-sm">839.39 HYPE</span>
            </p>
          </div>
          <div className="mx-3">
            <Image src={arrowsorticon} alt="Swap" style={{ width: 17, height: 'auto' }} />
          </div>
          <div className="flex-1 border-2 border-white/10 bg-gradient-to-b from-white/5 to-gray-500/5 px-4 py-3 rounded-xl text-start">
            <p className="text-sm mb-1.5 font-medium text-[#8B8BA0]">To</p>
            <p className="text-base font-medium text-white">Spot Balance</p>
            <p className="text-xs text-[#8B8BA0] font-medium">
              Balance: <span className="text-white text-sm">95,123.24 HYPE</span>
            </p>
          </div>
        </div>
        <div className="flex items-center border-2 border-white/10 bg-gradient-to-b from-white/5 to-gray-500/5 px-3 py-2 rounded-lg mb-3">
          <input
            type="number"
            placeholder="0.00"
            className="bg-transparent text-white placeholder-[#8B8BA0] text-lg w-full outline-none"
          />
          <Image
            src={hyperliquidicon}
            alt="HYPE"
            style={{ width: 20, height: 'auto' }}
            className="ml-2"
          />
          <span className="text-white mx-3 text-sm font-medium">HYPE</span>
          <button className="text-[#8B8BA0] border py-1 px-2 border-white/10 bg-[#FFFFFF0F] text-sm font-medium rounded-lg">
            MAX
          </button>
        </div>
        <div className="flex items-center text-xs text-white/40 mb-5">
          <p>
            ETA for Staking → Spot transfer: <span className="text-white">7 days.</span>
          </p>
          <Image src={infoicon} alt="Info" style={{ width: 14, height: 'auto' }} className="ml-1" />
        </div>
        <button className="w-full bg-primary cursor-pointer text-white py-3 rounded-xl text-base font-semibold">
          Transfer
        </button>
      </div>
    </Modal>
  )
}

export default TransferModal
