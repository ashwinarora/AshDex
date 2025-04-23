import React from 'react'
import { useWalletModal } from '@/context/WalletModalContext'
import { IconWallet } from '@tabler/icons-react'

function ConnectWalletButton() {
  const { toggleConnectWalletModal } = useWalletModal()
  return (
    <button
      onClick={toggleConnectWalletModal}
      className="nexon-button nexon-primary w-full flex text-center gap-2 items-center  justify-center"
    >
      <IconWallet className="w-5 h-5" />
      Connect Wallet
    </button>
  )
}

export default ConnectWalletButton
