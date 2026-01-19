'use client'
import React from 'react'
import Image, { StaticImageData } from 'next/image'
import {
  IconAlertCircle,
  IconLoader,
  IconRosetteDiscountCheck,
  IconWallet
} from '@tabler/icons-react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { useTranslate } from '@tolgee/react'

interface WalletDisplayProps {
  name: string
  icon: StaticImageData | string
  onBack: () => void
  hasAgreedToRules: boolean
  status: string
  onClose: () => void
}

const WalletDisplay: React.FC<WalletDisplayProps> = ({
  name,
  icon,
  onBack,
  hasAgreedToRules,
  status,
  onClose
}) => {
  const { t } = useTranslate()
  const isConnecting = status === 'pending'
  const isDisconnected = status === 'error'

  return (
    <div className="w-full h-80 flex flex-col items-center justify-center bg-secondary">
      {hasAgreedToRules ? (
        <div className="w-full flex h-full flex-col gap-2 items-center justify-between">
          <div className="flex flex-col gap-2 items-center justify-center h-full">
            <IconRosetteDiscountCheck className="size-10 text-green" />
            <h1 className="text-white font-medium text-lg">{t('Wallet connected!')}</h1>
            <h2 className="text-white/70 font-medium text-center text-sm">
              {t('You are ready to deposit, trade, and manage your assets.')}
            </h2>
          </div>
          <Button className="w-full shrink-0" onClick={onClose}>
            {t("Let's Go!")}
          </Button>
        </div>
      ) : (
        <div className="w-full flex h-full flex-col gap-2 items-center justify-between">
          <div className="flex flex-col gap-2 items-center justify-center h-full">
            {icon === 'IconWallet' ? (
              <div className="size-10 rounded-md bg-white/10 flex items-center justify-center">
                <IconWallet className="size-6 text-white" />
              </div>
            ) : (
              <Image src={icon} alt={name} width={80} height={80} className={cn('size-20')} />
            )}
            <h1 className="text-white font-medium text-lg">
              {name} {['Trust Wallet', 'Rabby Wallet'].includes(name) ? '' : t('Wallet')}
            </h1>
            <div className="text-white/70 font-medium text-sm flex items-center gap-2">
              {isConnecting && (
                <>
                  <IconLoader className="size-5 animate-spin text-white" />
                  <div className="text-white/70 text-sm">{t('Waiting for connection...')}</div>
                </>
              )}
              {isDisconnected && (
                <>
                  <IconAlertCircle className="size-5 text-red" />
                  <div className="text-red text-sm">{t('Connection failed')}</div>
                </>
              )}
            </div>
          </div>
          {isDisconnected && (
            <Button className="w-full shrink-0" onClick={onBack}>
              {t('Try Again?')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export { WalletDisplay }
