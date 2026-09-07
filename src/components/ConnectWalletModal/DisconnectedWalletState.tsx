'use client'
import { useWalletModal } from '@/context/WalletModalContext'
import { Button } from '../ui/button'
import { IconWalletOff } from '@tabler/icons-react'
type WalletNotConnectedProps = {
  title?: string
  description?: string
  type?: string
}

const WalletNotConnected: React.FC<WalletNotConnectedProps> = ({
  title = 'Your Wallet is Disconnected',
  description = 'Connect your wallet to access your balance, deposit funds, and trade.'
}) => {
  const { openConnectWalletModal } = useWalletModal()
  return (
    <div className="flex flex-col w-full h-full justify-center gap-4 items-center">
      <IconWalletOff className="size-10 text-white" />
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="text-sm text-center text-white/70 -mt-2">{description}</p>
      <Button onClick={openConnectWalletModal}>{'Connect Wallet'}</Button>
    </div>
  )
}

export default WalletNotConnected
