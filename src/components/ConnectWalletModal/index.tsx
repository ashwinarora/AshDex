'use client'

import React, { useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import { useConnect, useDisconnect } from 'wagmi'
import { TrustWallet } from '@trustwallet/web3-react-trust-wallet'
import { initializeConnector } from '@web3-react/core'
import { WALLETS } from '@/utils/constants'
import { WalletDisplay } from './WalletDisplay'
import WalletRules from './WalletRules'
import nexticon from '@/assets/images/next_icon.svg'
import { useWalletModal } from '@/context/WalletModalContext'
import { useTermsSignature } from '@/hooks/useTermsSignature'
import { toast } from 'sonner'
import { DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

interface WalletConnectProvider {
  id: string
  name: string
  icon: StaticImageData | string
}

const ConnectWalletModal: React.FC = () => {
  const { toggleConnectWalletModal } = useWalletModal()
  const { connectAsync, connectors, reset } = useConnect()
  const { disconnect } = useDisconnect()
  const [selectedConnector, setSelectedConnector] = useState<WalletConnectProvider | null>(null)
  const [isWalletConnected, setIsWalletConnected] = useState<boolean | null>(null)
  const [trustWallet] = initializeConnector<TrustWallet>((actions) => new TrustWallet({ actions }))

  const { data: termsData, isLoading: isTermsLoading } = useTermsSignature()

  const handleClose = () => {
    if (!termsData?.signed) {
      disconnect()
      toast.error('Please sign the latest terms to connect your wallet.')
    }
    toggleConnectWalletModal()
    setSelectedConnector(null)
    setIsWalletConnected(null)
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

  // Show rules if wallet is connected and terms are not signed
  const shouldShowRules = isWalletConnected && !isTermsLoading && !termsData?.signed

  return (
    <>
      <DialogHeader>
        <DialogTitle>Connect Wallet</DialogTitle>
      </DialogHeader>
      <DialogContent>
        {/* Content */}
        {shouldShowRules ? (
          <WalletRules onClose={handleClose} />
        ) : selectedConnector ? (
          isWalletConnected && isTermsLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              <p className="text-white mt-4">Loading terms...</p>
            </div>
          ) : (
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
              hasAgreedToRules={!!termsData?.signed}
            />
          )
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
              <p className="text-sm text-white mb-2">Don&apos;t have a wallet?</p>
              <button className="px-6 py-3 bg-[#1c1624] text-white font-bold rounded-xl hover:bg-[#36303b]">
                Create
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </>
    // <div className="fixed inset-0 z-50 flex items-center justify-center">
    //   {/* Backdrop */}
    //   <div className="absolute inset-0 bg-black/50  backdrop-blur-sm" onClick={handleClose} />
    //   {/* Modal Container */}
    //
    // </div>
  )
}

export default ConnectWalletModal
