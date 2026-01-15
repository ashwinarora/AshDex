'use client'
import { wagmiConfig } from '@/app/WagmiProvider'
import { Dialog } from '@/components/ui/dialog'
import { config } from '@/config/wagmi'
import dynamic from 'next/dynamic'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { switchChain } from 'wagmi/actions'

const ConnectWalletModal = dynamic(() => import('@/components/ConnectWalletModal/ConnectWalletModal'), {
  ssr: false
})

interface WalletModalContextProps {
  isModalOpen: boolean
  openConnectWalletModal: () => void
  closeConnectWalletModal: () => void
}

const WalletModalContext = createContext<WalletModalContextProps | undefined>(undefined)

export const WalletModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { chainId, isConnected } = useAccount()

  const openConnectWalletModal = () => setIsModalOpen(true)
  const closeConnectWalletModal = () => setIsModalOpen(false)

  useEffect(() => {
    if (isConnected && config.chains.length && chainId) {
      const chains: number[] = config.chains.map((chain) => chain.id)
      if (!chains.includes(chainId)) {
        switchChain(wagmiConfig, { chainId: chains[0] })
      }
    }
  }, [isConnected, chainId])

  return (
    <WalletModalContext.Provider value={{ isModalOpen, openConnectWalletModal, closeConnectWalletModal }}>
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ConnectWalletModal />
        </Dialog>
      )}
      {children}
    </WalletModalContext.Provider>
  )
}

export const useWalletModal = (): WalletModalContextProps => {
  const context = useContext(WalletModalContext)
  if (!context) {
    throw new Error('useWalletModal must be used within a WalletModalProvider')
  }
  return context
}
