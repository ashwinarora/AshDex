'use client'
import { useState } from 'react'
import Image from 'next/image'
import bridgingbtnlogo from '@/assets/images/bridge_icon.svg'
import BridgeModal from '../Bridge/BridgeModal'
import { SolanaWalletProvider } from '../Bridge/SolanaButton'
import { TronWalletProvider } from '../Bridge/TronProvider'
// Create a singleton instance of AppKit

const BridgeButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 nexon-button nexon-ghost"
      >
        <Image
          style={{ width: 20, height: 'auto' }}
          src={bridgingbtnlogo}
          alt="bridgingbtnlogo"
          className="w-5 h-5"
        />
        Bridge
      </button>
      <SolanaWalletProvider>
        <TronWalletProvider>
          <BridgeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </TronWalletProvider>
      </SolanaWalletProvider>
    </div>
  )
}

export default BridgeButton
