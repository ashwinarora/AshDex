'use client'
import { useState } from 'react'
import DepositModal from '@/components/DepositWithdraw/DepositModal'
import SendModal from '@/components/UserData/component/SendModal'
import { Button } from '../ui/button'
import WithdrawModal from '../DepositWithdraw/WithdrawModal'
import { IconCash, IconTransfer } from '@tabler/icons-react'
import { useScreenSize } from '@/hooks/useScreenSize'
import SpotToPerpTransferModal from '../UserData/component/transfers/spot-to-perp'
import SpotToEvmTransferModal from '../UserData/component/transfers/spot-to-evm'
import { cn } from '@/lib/utils'
const PortfolioHeader = () => {
  const isRTL = false
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
        <div
          className={cn(
            'flex bg-secondary flex-col gap-4 rounded-md justify-between w-full h-fit p-4',
            isRTL ? 'items-end' : 'items-start'
          )}
        >
          <h1 className={cn('text-2xl text-white', isRTL ? 'text-end' : 'text-start')}>
            {'Portfolio'}
          </h1>
          <div className={cn('flex flex-wrap gap-2 w-full', isRTL && 'flex-row-reverse')}>
            <Button
              className={cn('flex-1 w-full', isRTL && 'flex-row-reverse')}
              variant={'outline'}
              onClick={() => setIsModalOpen({ ...isModalOpen, send: true })}
            >
              {'Send'}
            </Button>

            <Button
              className={cn('flex-1 w-full', isRTL && 'flex-row-reverse')}
              variant={'outline'}
              onClick={() => setIsModalOpen({ ...isModalOpen, spotToPerp: true })}
            >
              <p>{'Perps'}</p>
              <IconTransfer className="size-3" />
              <p>{'Spot'}</p>
            </Button>
            <Button
              className={cn('flex-1 w-full', isRTL && 'flex-row-reverse')}
              variant={'outline'}
              onClick={() => setIsModalOpen({ ...isModalOpen, spotToEvm: true })}
            >
              <p>{'EVM'}</p>
              <IconTransfer className="size-3" />
              <p>{'Spot'}</p>
            </Button>
            <Button
              className={cn(isRTL && 'flex-row-reverse')}
              variant={'outline'}
              onClick={() => setIsModalOpen({ ...isModalOpen, withdraw: true })}
            >
              {'Withdraw'}
            </Button>
            <Button
              className={cn('flex-1 w-full', isRTL && 'flex-row-reverse')}
              onClick={() => setIsModalOpen({ ...isModalOpen, deposit: true })}
            >
              <IconCash className="size-4" />
              {'Deposit'}
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
          'flex gap-4 rounded-md items-center justify-between w-full h-fit p-4',
          isRTL && 'flex-row-reverse'
        )}
      >
        <h1 className="text-3xl shrink-0 font-semibold text-white">{'Portfolio'}</h1>
        <div className={cn('flex flex-1 w-full gap-2 justify-end', isRTL && 'flex-row-reverse')}>
          <Button
            className="w-fit"
            onClick={() => setIsModalOpen({ ...isModalOpen, deposit: true })}
          >
            <IconCash className="size-4" />
            {'Deposit'}
          </Button>
          <Button
            className="w-fit"
            variant={'outline'}
            onClick={() => setIsModalOpen({ ...isModalOpen, withdraw: true })}
          >
            {'Withdraw'}
          </Button>
          <Button
            className="w-fit"
            variant={'outline'}
            onClick={() => setIsModalOpen({ ...isModalOpen, spotToPerp: true })}
          >
            <p>{'Perps'}</p>
            <IconTransfer className="size-3" />
            <p>{'Spot'}</p>
          </Button>
          <Button
            className="w-fit"
            variant={'outline'}
            onClick={() => setIsModalOpen({ ...isModalOpen, spotToEvm: true })}
          >
            <p>{'EVM'}</p>
            <IconTransfer className="size-3" />
            <p>{'Spot'}</p>
          </Button>
          <Button
            className="w-fit"
            variant={'outline'}
            onClick={() => setIsModalOpen({ ...isModalOpen, send: true })}
          >
            {'Send'}
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
