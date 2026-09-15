'use client'

import React, { useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import { useConnect, useDisconnect, useConnectors } from 'wagmi'
import { TrustWallet } from '@trustwallet/web3-react-trust-wallet'
import { initializeConnector } from '@web3-react/core'
import { WALLETS } from '@/utils/constants'
import { WalletDisplay } from './WalletDisplay'
import { useWalletModal } from '@/context/WalletModalContext'
import { DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { IconWallet } from '@tabler/icons-react'

interface WalletConnectProvider {
  id: string
  name: string
  icon: StaticImageData | string
}

const ConnectWalletModal: React.FC = () => {
  const { closeConnectWalletModal } = useWalletModal()
  const connect = useConnect()
  const connectors = useConnectors()
  const disconnect = useDisconnect()
  const [selectedConnector, setSelectedConnector] = useState<WalletConnectProvider | null>(null)
  const [trustWallet] = initializeConnector<TrustWallet>((actions) => new TrustWallet({ actions }))

  const handleClose = () => {
    closeConnectWalletModal()
    setSelectedConnector(null)
    connect.reset()
  }

  const connectWallet = async (wallet: WalletConnectProvider) => {
    setSelectedConnector(wallet)
    try {
      const connector = connectors.find((c) => c.id === wallet.id)
      if (connector) {
        await connect.mutateAsync({ connector })
      } else if (wallet.id === 'trustWallet') {
        await trustWallet.activate()
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  return (
    <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
      <DialogHeader>
        <DialogTitle>Connect Wallet</DialogTitle>
      </DialogHeader>
      {selectedConnector ? (
        <WalletDisplay
          onBack={() => {
            disconnect.mutate()
            setSelectedConnector(null)
            connect.reset()
          }}
          status={connect.status}
          onClose={handleClose}
          name={selectedConnector.name}
          icon={selectedConnector.icon}
          hasAgreedToRules={connect.status === 'success'}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {WALLETS.map((wallet) => (
            <Button
              className="w-full flex h-fit items-center justify-start gap-4 transition-colors text-white bg-white/10 hover:bg-accent"
              variant={'secondary'}
              key={wallet.id}
              onClick={() => connectWallet(wallet)}
              /*
                R1-UX4: the accessible name previously combined the image alt
                ("MetaMask") + the visible span ("MetaMask") into "MetaMask
                MetaMask". Give the button an explicit aria-label and mark
                the icon as decorative (alt="") so screen readers announce
                the name once.
              */
              aria-label={wallet.name}
            >
              {wallet.icon ? (
                wallet.icon === 'IconWallet' ? (
                  <div className="size-10 rounded-md bg-white/10 flex items-center justify-center">
                    <IconWallet className="size-6 text-white" aria-hidden />
                  </div>
                ) : (
                  <Image
                    src={wallet.icon}
                    alt=""
                    width={36}
                    height={36}
                    className="rounded-md size-10"
                    aria-hidden
                  />
                )
              ) : null}
              <span className="font-medium text-sm">{wallet.name}</span>
            </Button>
          ))}
        </div>
      )}
    </DialogContent>
  )
}

export default ConnectWalletModal
