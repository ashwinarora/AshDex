'use client'
import React from 'react'
import Image, { StaticImageData } from 'next/image'
import { IconAlertCircle, IconLoader, IconRosetteDiscountCheck } from '@tabler/icons-react'
import { useAccount } from 'wagmi'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

interface WalletDisplayProps {
  name: string
  icon: StaticImageData | string
  onBack: () => void
  hasAgreedToRules: boolean
  onClose: () => void
}

const WalletDisplay: React.FC<WalletDisplayProps> = ({
  name,
  icon,
  onBack,
  hasAgreedToRules,
  onClose
}) => {
  const { status } = useAccount()
  const isConnecting = status === 'connecting'
  const isDisconnected = status === 'disconnected'
  return (
    <div className="w-full h-80 flex flex-col items-center justify-center bg-secondary">
      {hasAgreedToRules ? (
        <div className="w-full flex h-full flex-col gap-2 items-center justify-between">
          <div className="flex flex-col gap-2 items-center justify-center h-full">
            <IconRosetteDiscountCheck className="size-10 text-green" />
            <h1 className="text-white font-medium text-lg">Wallet connected!</h1>
            <h2 className="text-white/50 font-medium text-sm">
              You&apos;re ready to deposit, trade, and manage your assets.
            </h2>
          </div>
          <Button className="w-full shrink-0" onClick={onClose}>
            Let&apos;s Go!
          </Button>
        </div>
      ) : (
        <div className="w-full flex h-full flex-col gap-2 items-center justify-between">
          <div className="flex flex-col gap-2 items-center justify-center h-full">
            <Image src={icon} alt={name} className={cn('size-20')} />
            <h1 className="text-white font-medium text-lg">
              {name} {['Trust Wallet', 'Rabby Wallet'].includes(name) ? '' : 'Wallet'}
            </h1>
            <div className="text-white/50 font-medium text-sm flex items-center gap-2">
              {isConnecting && (
                <>
                  <IconLoader className="size-5 animate-spin text-white" />
                  <div className="text-white/50 text-sm">Waiting for connection...</div>
                </>
              )}
              {isDisconnected && (
                <>
                  <IconAlertCircle className="size-5 text-red" />
                  <div className="text-red text-sm">Connection failed</div>
                </>
              )}
            </div>
          </div>
          {isDisconnected && (
            <Button className="w-full shrink-0" onClick={onBack}>
              Try Again?
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export { WalletDisplay }
