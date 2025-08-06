'use client'
import { useState } from 'react'
import BridgeModal from '../Bridge/BridgeModal'
import { SolanaWalletProvider } from '../Bridge/SolanaButton'
import { TronWalletProvider } from '../Bridge/TronProvider'
import { Button } from '../ui/button'
import { IconBuildingBridge } from '@tabler/icons-react'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
// Create a singleton instance of AppKit

const BridgeButton = () => {
  const [, setIsModalOpen] = useState(false)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-xs text-white"
          variant={'outline'}
          size={'sm'}
        >
          <IconBuildingBridge className="size-4" />
          Bridge
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-2xl h-fit flex flex-col items-center justify-start gap-2">
        <SolanaWalletProvider>
          <TronWalletProvider>
            <BridgeModal onClose={() => setIsModalOpen(false)} />
          </TronWalletProvider>
        </SolanaWalletProvider>
      </DialogContent>
    </Dialog>
  )
}

export default BridgeButton
