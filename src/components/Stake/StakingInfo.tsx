'use client'
import { useState } from 'react'
import Image from 'next/image'
import TransferModal from './TransferModal'
import hyperliquidicon from '@/assets/images/hyperliquid_icon.svg'
import arrowsorticon from '@/assets/images/arrowsort_icon.svg'

type StakingInfoProps = {
  setIsViewHistory?: (value: boolean) => void
}

const StakingInfo: React.FC<StakingInfoProps> = ({ setIsViewHistory }) => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)

  const handleViewHistory = () => {
    if (setIsViewHistory) {
      setIsViewHistory(true)
    }
  }
  const toggleTransferModal = () => {
    setIsTransferModalOpen((prev) => !prev)
  }

  return (
    <>
      <div className="rounded-2xl space-y-4">
        <div
          style={{
            background:
              'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
          }}
          className="rounded-xl border-2 border-white/10 p-3 backdrop-blur-[40px]"
        >
          <p className="text-[#8B8BA0] mb-1 font-medium tracking-normal text-sm">Total staked</p>
          <p className="text-xl font-medium tracking-normal text-white flex items-center gap-2">
            <Image
              src={hyperliquidicon}
              alt="hyperliquidicon"
              style={{ width: 20, height: 'auto' }}
              className="w-5 h-5 cursor-pointer"
            />
            1,498,283.92 HYPE
          </p>
        </div>
        <div
          style={{
            background:
              'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
          }}
          className="rounded-xl border-2 border-white/10 p-3 backdrop-blur-[40px]"
        >
          <p className="text-[#8B8BA0] font-medium text-sm">Available Staking Balance</p>
          <p className="text-xl font-medium text-white">95,123.24 HYPE</p>
          <button
            onClick={toggleTransferModal}
            className="w-full text-sm my-3 bg-primary cursor-pointer text-white py-2.5 rounded-xl font-bold flex justify-center items-center gap-2"
          >
            Spot{' '}
            <Image
              src={arrowsorticon}
              alt="arrowsorticon"
              style={{ width: 15, height: 'auto' }}
              className="w-3.5 h-3.5 cursor-pointer"
            />
            Staking Transfer
          </button>
          <div
            style={{
              background:
                'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
            }}
            className="p-2.5 rounded-xl font-medium mt-4 border-2 border-white/10 backdrop-blur-[40px] flex justify-between items-center"
          >
            <p className="text-[#8B8BA0] text-xs">Pending Transfers to Spot Balance</p>
            <p className="flex text-white text-base items-center gap-2">
              <Image
                src={hyperliquidicon}
                alt="hyperliquidicon"
                className="w-4 h-4 cursor-pointer"
                style={{ width: 16, height: 'auto' }}
              />
              5,849.00 HYPE
            </p>
          </div>
        </div>
        <button
          onClick={handleViewHistory}
          className="w-full bg-white/10 text-white text-sm py-3 rounded-xl font-semibold tracking-normal cursor-pointer"
        >
          View Actions history
        </button>
      </div>
      <TransferModal isOpen={isTransferModalOpen} onClose={toggleTransferModal} />
    </>
  )
}

export default StakingInfo
