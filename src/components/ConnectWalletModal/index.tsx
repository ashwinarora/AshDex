'use client'
import React, { useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import { useConnect } from 'wagmi'
import { WALLETS } from '@/utils/constants'
import Modal from '../common/Modal'
import { WalletDisplay } from './WalletDisplay'
import WalletRules from './WalletRules'
import nexticon from '@/assets/images/next_icon.svg'
import menuClose from '@/assets/images/close_icon.svg'

interface WalletConnectProvider {
  id: string
  name: string
  icon: StaticImageData | string
}

const ConnectWalletModal: React.FC<{
  isModalOpen: boolean
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ isModalOpen, setIsModalOpen }) => {
  const { connectAsync, connectors, reset } = useConnect()
  const [selectedConnector, setSelectedConnector] = useState<
    WalletConnectProvider | null | undefined
  >(null)
  const [isWalletConnected, setIsWalletConnected] = useState<boolean | null>(null)
  const [hasAgreedToRules, setHasAgreedToRules] = useState(false)

  const handleAgreeToRules = () => {
    setHasAgreedToRules(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedConnector(null)
    setIsWalletConnected(null)
    setHasAgreedToRules(false)
  }

  const connectWallet = async (wallet: WalletConnectProvider) => {
    const connector = connectors?.find((c) => c.id === wallet.id)
    if (!connector) {
      console.error('Connector not found for wallet:', wallet.id)
      return
    }
    if (wallet.id) {
      try {
        const walletConnector = WALLETS.find((c) => c.id === wallet.id)
        setSelectedConnector(walletConnector)
        const result = await connectAsync({ connector })
        if (result) {
          setIsWalletConnected(true)
        }
      } catch (error) {
        console.error('Error connecting wallet 123:', error)
        setIsWalletConnected(false)
      } finally {
        // handleCloseModal();
      }
    }
  }
  return (
    <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
      <div
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
        className="w-full border-[2px] bg-[#0F0816] max-w-md p-6 rounded-2xl shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full-Width Header */}
        <div className="flex items-center justify-between mb-4 w-full">
          <h2 className="text-xl text-[#FFFFFF] font-medium">
            {isWalletConnected && !hasAgreedToRules ? 'Rules' : 'Connect Wallet'}
          </h2>
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

        {/* Show Wallet Rules if Wallet is Connected */}
        {isWalletConnected && !hasAgreedToRules && (
          <WalletRules onAgree={handleAgreeToRules} onClose={handleCloseModal} />
        )}

        {/* Content Section: Left (Wallet List) & Right (QR Code) */}
        <div className="flex gap-6">
          {selectedConnector && (!isWalletConnected || hasAgreedToRules) && (
            <WalletDisplay
              onBack={() => {
                setIsWalletConnected(null)
                setSelectedConnector(null)
                reset()
              }}
              onClose={handleCloseModal}
              name={selectedConnector.name}
              icon={selectedConnector.icon}
              isWalletConnected={isWalletConnected}
              hasAgreedToRules={hasAgreedToRules}
            />
          )}
          {!selectedConnector && (
            <div className="w-full">
              <div className="space-y-2 mt-3">
                {WALLETS?.map((wallet, index) => (
                  <button
                    key={index}
                    onClick={() => connectWallet(wallet)}
                    className={`w-full flex border border-[#33293B] items-center justify-between px-3
                 ${index === WALLETS?.length - 1 ? 'py-[14px]' : 'py-2'}
                 bg-[#1c1624] hover:bg-[#36303b] rounded-xl cursor-pointer`}
                  >
                    <div className="flex items-center">
                      {wallet.icon && (
                        <Image
                          src={wallet?.icon}
                          alt={wallet?.name}
                          width={100}
                          height={100}
                          className="w-9 h-9 mr-3 rounded-md"
                        />
                      )}
                      <span className="text-[#FFFFFF] font-medium text-base">{wallet?.name}</span>
                    </div>
                    <Image
                      height={20}
                      width={20}
                      src={nexticon}
                      alt="nexticon"
                      className="w-3 h-3 mr-2"
                    />
                  </button>
                ))}
              </div>

              <div className="mt-6 w-full flex flex-col items-start">
                <div className="text-sm text-white">Don’t have a wallet?</div>
                <button className="w-full px-5 mt-2 text-sm font-bold py-4 text-white bg-[#1c1624] hover:bg-[#36303b] rounded-xl cursor-pointer text-center">
                  Create
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ConnectWalletModal
