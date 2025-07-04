import { useEffect } from 'react'

import { useState } from 'react'
import { toast } from 'sonner'
import Modal from '../common/Modal'
import { IconX } from '@tabler/icons-react'
import Image from 'next/image'
import { useBridge } from '@/context/BridgeContext'
import { useSolanaWallet } from './SolanaButton'
import type { Wallet } from '@solana/wallet-adapter-react'

function BridgeWalletModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { sourceChain } = useBridge()
  const { wallets: solanaWallets, select: setSelectedSolanaWallet } = useSolanaWallet()

  const [supportedWallets, setSupportedWallets] = useState<Wallet[]>([])

  useEffect(() => {
    if (sourceChain?.chainSymbol === 'SOL') {
      setSupportedWallets(solanaWallets || [])
    }
  }, [sourceChain, solanaWallets])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4 bg-white/5 p-4 border-2 border-white/5 rounded-2xl">
        <div className="flex justify-between items-center gap-2">
          <h4 className="text-white">Select a Solana Wallet</h4>
          <IconX
            className="bg-white/5 p-1.5 rounded-full text-white cursor-pointer"
            onClick={onClose}
          />
        </div>
        {supportedWallets.length > 0 ? (
          supportedWallets.map((wallet) => (
            <div key={wallet.adapter.name}>
              <div
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-all duration-300 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedSolanaWallet(wallet.adapter.name)
                  toast.info('Connecting to ' + wallet.adapter.name)
                  onClose()
                }}
              >
                <Image src={wallet.adapter.icon} alt={wallet.adapter.name} width={20} height={20} />
                {wallet.adapter.name}
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-white/50 text-center">No wallets available</div>
        )}
      </div>
    </Modal>
  )
}

export default BridgeWalletModal
