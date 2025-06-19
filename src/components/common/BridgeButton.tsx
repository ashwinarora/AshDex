'use client'
import { useState } from 'react'
import BridgeModal from '../Bridge/BridgeModal'
import { SolanaWalletProvider } from '../Bridge/SolanaButton'
import { TronWalletProvider } from '../Bridge/TronProvider'
import { Button } from '../ui/button'
import { WaypointsIcon } from 'lucide-react'
// Create a singleton instance of AppKit

const BridgeButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 text-xs text-white"
        variant={'outline'}
        size={'sm'}
      >
        {/* <Image
          style={{ width: 20, height: 'auto' }}
          src={bridgingbtnlogo}
          alt="bridgingbtnlogo"
          className="w-5 h-5"
        /> */}
        <WaypointsIcon className="size-4" />
        Bridge
      </Button>
      <SolanaWalletProvider>
        <TronWalletProvider>
          <BridgeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </TronWalletProvider>
      </SolanaWalletProvider>
    </div>
  )
}

export default BridgeButton
