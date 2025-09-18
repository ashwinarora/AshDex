import React from 'react'
import { useWalletModal } from '@/context/WalletModalContext'
import { IconWallet } from '@tabler/icons-react'
import { useTranslate } from '@tolgee/react'

function ConnectWalletButton() {
  const { toggleConnectWalletModal } = useWalletModal()
  const { t } = useTranslate()
  return (
    <button
      onClick={toggleConnectWalletModal}
      className="nexon-button nexon-primary w-full flex text-center gap-2 items-center  justify-center"
    >
      <IconWallet className="w-5 h-5" />
      {t('Connect Wallet')}
    </button>
  )
}

export default ConnectWalletButton
