'use client'
import { config } from '@/config/wagmi'
import dynamic from 'next/dynamic'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { switchChain } from 'wagmi/actions'

const ConnectWalletModal = dynamic(() => import('@/components/ConnectWalletModal'), {
  ssr: false
})

interface WalletModalContextProps {
  isModalOpen: boolean
  toggleConnectWalletModal: () => void
}

const WalletModalContext = createContext<WalletModalContextProps | undefined>(undefined)

export const WalletModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { chainId, isConnected } = useAccount()

  const toggleConnectWalletModal = () => setIsModalOpen((s) => !s)

  useEffect(() => {
    if (isConnected && config.chains.length && chainId) {
      const chains: number[] = config.chains.map((chain) => chain.id)
      if (!chains.includes(chainId)) {
        switchChain(config, { chainId: chains[0] as 42161 | 421614 })
      }
    }
  }, [isConnected, chainId])

  return (
    <WalletModalContext.Provider value={{ isModalOpen, toggleConnectWalletModal }}>
      {isModalOpen && <ConnectWalletModal />}
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
