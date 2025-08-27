'use client'
import { useState } from 'react'
import DepositModal from '@/components/DepositWithdraw/DepositModal'
import SendModal from '@/components/Trading/UserData/component/SendModal'
import { Button } from '../ui/button'
import WithdrawModal from '../DepositWithdraw/WithdrawModal'
import { IconCash, IconTransfer } from '@tabler/icons-react'
import { useScreenSize } from '@/hooks/useScreenSize'
import SpotToPerpTransferModal from '../Trading/UserData/component/transfers/spot-to-perp'
import SpotToEvmTransferModal from '../Trading/UserData/component/transfers/spot-to-evm'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/userStore'
import { useTranslate } from '@tolgee/react'

const PortfolioHeader = () => {
  const { t } = useTranslate()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar')
  const { isMobile } = useScreenSize()
  const [isModalOpen, setIsModalOpen] = useState<{
    [key: string]: boolean
  }>({
    deposit: false,
    spotToPerp: false,
    spotToEvm: false,
    withdraw: false,
    send: false
  })

  if (isMobile) {
    return (
      <>
        <div className="flex flex-col gap-4 bg-secondary rounded-md items-start justify-between w-full h-fit p-4">
          <h1 className="text-2xl text-white text-start">{t('Portfolio')}</h1>
          <div className="flex flex-wrap gap-2">
            <Button
              className="flex-1 w-full"
              variant={'outline'}
              onClick={() => setIsModalOpen({ ...isModalOpen, send: true })}
            >
              {t('Send')}
            </Button>

            <Button
              className="flex-1 w-full"
              variant={'outline'}
              onClick={() => setIsModalOpen({ ...isModalOpen, spotToPerp: true })}
            >
              <p>{t('Perps')}</p>
              <IconTransfer className="size-3" />
              <p>{t('Spot')}</p>
            </Button>
            <Button
              className="flex-1 w-full"
              variant={'outline'}
              onClick={() => setIsModalOpen({ ...isModalOpen, spotToEvm: true })}
            >
              <p>{t('EVM')}</p>
              <IconTransfer className="size-3" />
              <p>{t('Spot')}</p>
            </Button>
            <Button
              variant={'outline'}
              onClick={() => setIsModalOpen({ ...isModalOpen, withdraw: true })}
            >
              {t('Withdraw')}
            </Button>
            <Button
              className="flex-1 w-full"
              onClick={() => setIsModalOpen({ ...isModalOpen, deposit: true })}
            >
              <IconCash className="size-4" />
              {t('Deposit')}
            </Button>
          </div>
        </div>
        {isModalOpen.deposit && (
          <DepositModal
            isOpen={isModalOpen.deposit}
            onClose={() => setIsModalOpen({ ...isModalOpen, deposit: false })}
          />
        )}
        {isModalOpen.spotToPerp && (
          <SpotToPerpTransferModal
            isOpen={isModalOpen.spotToPerp}
            onClose={() => setIsModalOpen({ ...isModalOpen, spotToPerp: false })}
          />
        )}
        {isModalOpen.spotToEvm && (
          <SpotToEvmTransferModal
            isOpen={isModalOpen.spotToEvm}
            onClose={() => setIsModalOpen({ ...isModalOpen, spotToEvm: false })}
          />
        )}
        {isModalOpen.send && (
          <SendModal
            isTriggeredByCustomButton={true}
            isOpen={isModalOpen.send}
            onClose={() => setIsModalOpen({ ...isModalOpen, send: false })}
          />
        )}
        {isModalOpen.withdraw && (
          <WithdrawModal
            isOpen={isModalOpen.withdraw}
            onClose={() => setIsModalOpen({ ...isModalOpen, withdraw: false })}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div
        className={cn(
          'flex gap-4 bg-secondary rounded-md items-center justify-between w-full h-fit p-4',
          isRTL && 'flex-row-reverse'
        )}
      >
        <h1 className="text-3xl font-semibold text-white">{t('Portfolio')}</h1>
        <div className={cn('flex gap-2', isRTL && 'flex-row-reverse')}>
          <Button
            className="w-32"
            onClick={() => setIsModalOpen({ ...isModalOpen, deposit: true })}
          >
            <IconCash className="size-4" />
            {t('Deposit')}
          </Button>
          <Button
            className="w-32"
            variant={'outline'}
            onClick={() => setIsModalOpen({ ...isModalOpen, withdraw: true })}
          >
            {t('Withdraw')}
          </Button>
          <Button
            className="w-32"
            variant={'outline'}
            onClick={() => setIsModalOpen({ ...isModalOpen, spotToPerp: true })}
          >
            <p>{t('Perps')}</p>
            <IconTransfer className="size-3" />
            <p>{t('Spot')}</p>
          </Button>
          <Button
            className="flex-1 w-full"
            variant={'outline'}
            onClick={() => setIsModalOpen({ ...isModalOpen, spotToEvm: true })}
          >
            <p>{t('EVM')}</p>
            <IconTransfer className="size-3" />
            <p>{t('Spot')}</p>
          </Button>
          <Button
            className="w-32"
            variant={'outline'}
            onClick={() => setIsModalOpen({ ...isModalOpen, send: true })}
          >
            {t('Send')}
          </Button>
        </div>
      </div>
      {isModalOpen.deposit && (
        <DepositModal
          isOpen={isModalOpen.deposit}
          onClose={() => setIsModalOpen({ ...isModalOpen, deposit: false })}
        />
      )}
      {isModalOpen.spotToPerp && (
        <SpotToPerpTransferModal
          isOpen={isModalOpen.spotToPerp}
          onClose={() => setIsModalOpen({ ...isModalOpen, spotToPerp: false })}
        />
      )}
      {isModalOpen.spotToEvm && (
        <SpotToEvmTransferModal
          isOpen={isModalOpen.spotToEvm}
          onClose={() => setIsModalOpen({ ...isModalOpen, spotToEvm: false })}
        />
      )}
      {isModalOpen.send && (
        <SendModal
          isTriggeredByCustomButton={true}
          isOpen={isModalOpen.send}
          onClose={() => setIsModalOpen({ ...isModalOpen, send: false })}
        />
      )}
      {isModalOpen.withdraw && (
        <WithdrawModal
          isOpen={isModalOpen.withdraw}
          onClose={() => setIsModalOpen({ ...isModalOpen, withdraw: false })}
        />
      )}
    </>
  )
}

export default PortfolioHeader
