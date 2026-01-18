'use client'

import React, { useEffect, useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { TrustWallet } from '@trustwallet/web3-react-trust-wallet'
import { initializeConnector } from '@web3-react/core'
import { WALLETS } from '@/utils/constants'
import { WalletDisplay } from './WalletDisplay'
import WalletRules from './WalletRules'
import { useWalletModal } from '@/context/WalletModalContext'
import { useTermsSignature } from '@/hooks/useTermsSignature'
import { DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { useCreateOrUpdateUser } from '@/hooks/useCreateOrUpdateUser'
import { Button } from '../ui/button'
import { IconLoader, IconWallet } from '@tabler/icons-react'
import { useTranslate } from '@tolgee/react'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/userStore'
import { ConnectedWallet, usePrivy, useWallets } from '@privy-io/react-auth'
import usePrivyWagmiStore from '@/store/PrivyWagmiStore'

interface WalletConnectProvider {
  id: string
  name: string
  icon: StaticImageData | string
}

const ConnectWalletModal: React.FC = () => {
  const { t } = useTranslate()
  const { closeConnectWalletModal } = useWalletModal()
  const { connectAsync, connectors, reset } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [dialogTitle, setDialogTitle] = useState<string>(t('Connect Wallet'))
  const [selectedConnector, setSelectedConnector] = useState<WalletConnectProvider | null>(null)
  const [trustWallet] = initializeConnector<TrustWallet>((actions) => new TrustWallet({ actions }))
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
  const { wallets } = useWallets()
  const embeddedWalletAddress = wallets?.find(
    (w: ConnectedWallet) => w?.walletClientType === 'privy'
  )?.address
  const walletId = address ?? embeddedWalletAddress
  const { data: termsData, isLoading: isTermsLoading } = useTermsSignature(walletId)
  const createOrUpdateUser = useCreateOrUpdateUser()
  const { authenticated } = usePrivy()
  // const { linkEmail } = useLinkAccount()
  // const [isPrivyLoginPending, setIsPrivyLoginPending] = useState(false)
  const { setIsUsingPrivy } = usePrivyWagmiStore()

  const handleClose = () => {
    closeConnectWalletModal()
    setSelectedConnector(null)
    reset()
    if (!termsData?.signed) {
      disconnect()
    }
  }

  const connectWallet = async (wallet: WalletConnectProvider) => {
    setIsUsingPrivy(false)
    setSelectedConnector(wallet)
    console.log('connecting wallet', wallet)
    try {
      const connector = connectors.find((c) => c.id === wallet.id)
      if (connector) {
        await connectAsync({ connector })
      } else if (wallet.id === 'trustWallet') {
        await trustWallet.activate()
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  // const handleEmailLogin = async () => {
  //   if (isPrivyLoginPending) return
  //   setIsUsingPrivy(true)
  //   setIsPrivyLoginPending(true)
  //   try {
  //     if (authenticated) {
  //       // Privy doesn't allow calling login() while authenticated; use a link helper instead.
  //       // This opens Privy's modal and prompts the user to link an email to the current user.
  //       linkEmail()
  //     } else {
  //       // Opens Privy's built-in login dialog (email + OTP handled by Privy)
  //       await login()
  //     }
  //   } catch (error) {
  //     console.error('Error signing in with email:', error)
  //   } finally {
  //     setIsPrivyLoginPending(false)
  //   }
  // }

  useEffect(() => {
    if ((isConnected || authenticated) && walletId) {
      createOrUpdateUser.mutate({ wallet_id: walletId })
    }
  }, [isConnected, authenticated, walletId])

  const shouldShowRules =
    (isConnected || authenticated) && !!walletId && !isTermsLoading && !termsData?.signed

  useEffect(() => {
    if (shouldShowRules) {
      setDialogTitle('Terms of Service')
    } else {
      setDialogTitle('Connect Wallet')
    }
  }, [shouldShowRules])

  // Show rules if wallet is connected and terms are not signed

  return (
    <>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(dialogTitle)}</DialogTitle>
        </DialogHeader>
        {shouldShowRules ? (
          <WalletRules onClose={handleClose} />
        ) : selectedConnector ? (
          isConnected && isTermsLoading ? (
            <div className="w-full h-80 flex flex-col gap-4 items-center justify-center">
              <IconLoader className="size-10 animate-spin" />
              <p className="text-white">{t('Loading terms...')}</p>
            </div>
          ) : (
            <WalletDisplay
              onBack={() => {
                disconnect()
                setSelectedConnector(null)
                reset()
              }}
              onClose={handleClose}
              name={selectedConnector.name}
              icon={selectedConnector.icon}
              hasAgreedToRules={!!termsData?.signed}
            />
          )
        ) : (
          <div className="flex flex-col gap-2">
            {/* Uncomment to enable Privy */}
            {/* <Button
              className={cn(
                'w-full flex h-fit items-center justify-start gap-4 transition-colors text-white bg-white/10 hover:bg-accent',
                isRTL && 'flex-row-reverse'
              )}
              variant={'secondary'}
              onClick={handleEmailLogin}
              disabled={isPrivyLoginPending}
            >
              <div className="size-10 rounded-md bg-white/10 flex items-center justify-center">
                {isPrivyLoginPending ? (
                  <IconLoader className="size-6 animate-spin text-white" />
                ) : (
                  <IconMail className="size-6 text-white" />
                )}
              </div>
              <span className="font-medium text-sm">{t('Sign in with Email')}</span>
            </Button> */}
            {WALLETS.map((wallet) => (
              <Button
                className={cn(
                  'w-full flex h-fit items-center justify-start gap-4 transition-colors text-white bg-white/10 hover:bg-accent',
                  isRTL && 'flex-row-reverse'
                )}
                variant={'secondary'}
                key={wallet.id}
                onClick={() => connectWallet(wallet)}
              >
                {wallet.icon ? (
                  wallet.icon === 'IconWallet' ? (
                    <div className="size-10 rounded-md bg-white/10 flex items-center justify-center">
                      <IconWallet className="size-6 text-white" />
                    </div>
                  ) : (
                    <Image
                      src={wallet.icon}
                      alt={wallet.name}
                      width={36}
                      height={36}
                      className="rounded-md size-10"
                    />
                  )
                ) : null}
                <span className="font-medium text-sm">{t(wallet.name)}</span>
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </>
  )
}

export default ConnectWalletModal
