'use client'

import React, { useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import { useConnect } from 'wagmi'
import { TrustWallet } from '@trustwallet/web3-react-trust-wallet'
import { initializeConnector } from '@web3-react/core'
import { WALLETS } from '@/utils/constants'
import { WalletDisplay } from './WalletDisplay'
import WalletRules from './WalletRules'
import nexticon from '@/assets/images/next_icon.svg'
import menuClose from '@/assets/images/close_icon.svg'
import { useWalletModal } from '@/context/WalletModalContext'

interface WalletConnectProvider {
  id: string
  name: string
  icon: StaticImageData | string
}

const ConnectWalletModal: React.FC = () => {
  const { toggleConnectWalletModal } = useWalletModal()
  const { connectAsync, connectors, reset } = useConnect()
  const [selectedConnector, setSelectedConnector] = useState<WalletConnectProvider | null>(null)
  const [isWalletConnected, setIsWalletConnected] = useState<boolean | null>(null)
  const [hasAgreedToRules, setHasAgreedToRules] = useState(false)
  const [trustWallet] = initializeConnector<TrustWallet>((actions) => new TrustWallet({ actions }))

  const handleClose = () => {
    toggleConnectWalletModal()
    setSelectedConnector(null)
    setIsWalletConnected(null)
    setHasAgreedToRules(false)
    reset()
  }

  const connectWallet = async (wallet: WalletConnectProvider) => {
    setSelectedConnector(wallet)
    try {
      const connector = connectors.find((c) => c.id === wallet.id)
      if (connector) {
        await connectAsync({ connector })
      } else if (wallet.id === 'trustWallet') {
        await trustWallet.activate()
      }
      setIsWalletConnected(true)
    } catch (error) {
      console.error('Error connecting wallet:', error)
      setIsWalletConnected(false)
    }
  }

  const handleAgreeToRules = () => setHasAgreedToRules(true)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50  backdrop-blur-sm" onClick={handleClose} />
      {/* Modal Container */}
      <div
        className="relative bg-[#0F0816] border border-white/10 rounded-2xl shadow-lg max-w-md w-full p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">
            {isWalletConnected && !hasAgreedToRules ? 'Rules' : 'Connect Wallet'}
          </h3>
          <button onClick={handleClose} className="p-2 bg-[#322944] rounded-full">
            <Image src={menuClose} alt="Close" width={16} height={16} />
          </button>
        </div>

        {/* Content */}
        {isWalletConnected && !hasAgreedToRules ? (
          <WalletRules onAgree={handleAgreeToRules} onClose={handleClose} />
        ) : selectedConnector ? (
          <WalletDisplay
            onBack={() => {
              setIsWalletConnected(null)
              setSelectedConnector(null)
              reset()
            }}
            onClose={handleClose}
            name={selectedConnector.name}
            icon={selectedConnector.icon}
            isWalletConnected={isWalletConnected}
            hasAgreedToRules={hasAgreedToRules}
          />
        ) : (
          <div className="space-y-4">
            {WALLETS.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => connectWallet(wallet)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#1c1624] border border-[#33293B] rounded-xl hover:bg-[#36303b] focus:outline-none"
              >
                <div className="flex items-center">
                  {wallet.icon && (
                    <Image
                      src={wallet.icon}
                      alt={wallet.name}
                      width={36}
                      height={36}
                      className="rounded-md mr-3"
                    />
                  )}
                  <span className="text-white font-medium">{wallet.name}</span>
                </div>
                <Image src={nexticon} alt="Next" width={12} height={12} />
              </button>
            ))}
            <div className="mt-6 text-center">
              <p className="text-sm text-white mb-2">Don’t have a wallet?</p>
              <button className="px-6 py-3 bg-[#1c1624] text-white font-bold rounded-xl hover:bg-[#36303b]">
                Create
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConnectWalletModal
