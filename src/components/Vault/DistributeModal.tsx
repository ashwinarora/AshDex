import React, { useState } from 'react'
import Image from 'next/image'
import vaultsDetailsData from '@/utils/VaultDetails.json'
import Modal from '../common/Modal'
import ProcessingDistribution from './ProcessingDistribution'
import menuClose from '@/assets/images/close_icon.svg'
import Slider1 from '@/assets/images/slider_value.svg'

interface DistributeModalProps {
  isVaultModal: boolean
  openVaultsModal: () => void
}

const DistributeModal: React.FC<DistributeModalProps> = ({ isVaultModal, openVaultsModal }) => {
  const { distributeDetails } = vaultsDetailsData
  const [isProcessing, setIsProcessing] = useState(false)
  const [usdPercent, setUsdPercent] = useState(0)
  const [isDistribute, setIsDistribute] = useState(false)
  const [amount, setAmount] = useState('$5,000')

  const handleUsdPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsdPercent = parseFloat(e.target.value) || 0
    setUsdPercent(newUsdPercent)
  }

  const handleCloseModal = () => {
    setIsDistribute(!isDistribute)
    openVaultsModal()
  }

  const handleConfirmDistribution = () => {
    setIsProcessing(!isProcessing)
  }

  const handleDistribute = () => {
    setIsDistribute(!isDistribute)
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
          <div className="flex items-start justify-between max-md:mb-0 mb-4 w-full">
            <p className="flex flex-col">
              <span className="text-lg text-white font-semibold tracking-[0em]">Distribute</span>
              <span className="text-white/50opacity-40 mt-1 text-sm font-normal tracking-normal">
                Distribute the available profit between the vault leader and depositors. Once
                distributed, funds will be credited to respective accounts.
              </span>
            </p>
            <button
              onClick={handleCloseModal}
              className="p-2 bg-[#322944] rounded-full text-white/50hover:text-white cursor-pointer"
            >
              <Image
                src={menuClose}
                alt="menuclose"
                width={20}
                height={20}
                className="w-auto h-auto"
              />
            </button>
          </div>

          <div
            style={{
              background:
                'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
            }}
            className="border border-white/10 max-md:mt-2 mt-6 rounded-2xl pt-2 pb-4 px-4 space-y-3"
          >
            {!isDistribute && (
              <div
                className="border-b py-3 mt-2 px-3.5 rounded-xl border-white/10"
                style={{
                  background:
                    'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%'
                }}
              >
                <span className="text-[#8B8BA0] text-sm font-medium">Amount to be distributed</span>
                <div className="flex gap-x-3 mt-1.5 justify-between items-center">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`rounded-md w-full py-1.5 px-2.5 border-2 border-[#FFFFFF0F] bg-white/10 text-white focus:outline-none focus:none focus:none text-base font-normal`}
                  />
                  <div className="relative">
                    <input
                      type="text"
                      className="w-16 h-10 px-2 rounded-md border-2 border-white/10 bg-white/10 outline-none text-start text-white"
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
            {!isDistribute && (
              <div
                style={{
                  background:
                    'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
                }}
                className="border-b mb-3 pt-3.5 pb-1 mt-2 px-3.5 rounded-xl border-white/10"
              >
                <p className="flex justify-between items-center">
                  <span className="text-[#8B8BA0] text-sm font-medium">
                    Profit Share for Leader
                  </span>
                  <span className="text-white text-sm font-medium">$500</span>
                </p>
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
              </div>
            )}
            {distributeDetails?.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-white/50opacity-50 text-sm font-normal">{item?.label}:</span>
                <span
                  className={`text-sm font-medium flex items-center gap-x-2 ${
                    index === 0
                      ? 'text-white'
                      : index === 1
                        ? 'text-[#FFA90A]'
                        : index === 2
                          ? 'text-green'
                          : 'text-white'
                  }`}
                >
                  {item?.value}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between gap-x-2 mt-6">
            <button
              className="text-[#8B8BA0] cursor-pointer w-1/2 text-base font-medium hover:text-white"
              onClick={isDistribute ? handleDistribute : handleCloseModal}
            >
              {isDistribute ? 'Back to Edit' : 'Cancel'}
            </button>
            <button
              onClick={isDistribute ? handleConfirmDistribution : handleDistribute}
              className=" w-1/2  px-[11px] justify-center  flex items-center py-[11px] bg-[#5F46F9] font-bold text-white text-sm rounded-lg md:rounded-xl cursor-pointer"
            >
              <span>{isDistribute ? 'Confirm distribution' : 'Distribute Now'}</span>
            </button>
          </div>
        </div>
      </Modal>
      <ProcessingDistribution
        isVaultModal={!!isProcessing}
        openVaultsModal={() => setIsProcessing(!isProcessing)}
        viewVault={() => openVaultsModal()}
      />
    </>
  )
}

export default DistributeModal
