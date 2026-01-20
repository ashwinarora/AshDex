import { useState } from 'react'
import { useConnection } from 'wagmi'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { toast } from 'sonner'
import { IconChevronDown, IconTransfer, IconWallet } from '@tabler/icons-react'
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DialogTitle } from '@/components/ui/dialog'
import { DialogHeader } from '@/components/ui/dialog'
import { DialogContent } from '@/components/ui/dialog'
import { Dialog } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import Loading from '@/components/loading-screen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { useTranslate } from '@tolgee/react'
import { useAgentApproval } from '@/context/EstablishConnection'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/userStore'
import { useWalletModal } from '@/context/WalletModalContext'

interface ITransferModal {
  isOpen: boolean
  onClose: () => void
  defaultToPerp?: boolean
}

const SpotToPerpTransferModal = ({ isOpen, onClose, defaultToPerp }: ITransferModal) => {
  const { chainId, address } = useConnection()
  const { t } = useTranslate()
  const [amount, setAmount] = useState<string>('')
  const { openConnectWalletModal } = useWalletModal()
  const { isAgentApproved, openModal: openAgentModal, currentFeeApproval } = useAgentApproval()
  const [toPerp, setToPerp] = useState(defaultToPerp || false)
  const { clearingHouseState, spotState, sdkUserSignerClient } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState,
      spotState: state.spotState,
      sdkUserSignerClient: state.sdkUserSignerClient
    }))
  )
  const [isLoading, setIsLoading] = useState(false)
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
  const getBalance = () => {
    if (toPerp) {
      const balance = spotState?.balances?.find((balance) => balance.coin === 'USDC')?.total
      if (!balance) return '0.00'
      const truncated = Math.floor(Number(balance) * 100) / 100
      return truncated.toFixed(2)
    } else {
      if (!clearingHouseState?.withdrawable) return '0.00'
      const truncated = Math.floor(Number(clearingHouseState.withdrawable) * 100) / 100
      return truncated.toFixed(2)
    }
  }

  const onTransferClick = async () => {
    if (!chainId) return
    if (!sdkUserSignerClient) return
    const toastId = toast.loading(t('Transferring...'))
    try {
      setIsLoading(true)
      const res = await sdkUserSignerClient.usdClassTransfer({ amount, toPerp })
      console.log('Transfer response:', res)
      onClose()
      toast.success(t('Transfer successful'), {
        id: toastId
      })
      setIsLoading(false)
    } catch (error) {
      console.error('Transfer failed:', error)
      onClose()
      toast.error(t('Something went wrong, check the console or contact support'), {
        id: toastId
      })
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('Transfer between Perp and Spot')}</DialogTitle>
          {/* <DialogDescription>{t('Transfer USDC between Perp and Spot.')}</DialogDescription> */}
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-full">
            <Loading
              title={t('Transfer in progress...')}
              subTitle={t('You will need to sign this transaction in your wallet:')}
              className="py-[1rem] px-[1rem]"
            />
          </div>
        ) : (
          <>
            <div
              className={cn('flex items-center gap-2 justify-between', isRTL && 'flex-row-reverse')}
            >
              <div className="flex-1 h-9 w-full flex items-center justify-center bg-white/10 text-accent-foreground rounded-md p-2 text-sm">
                {toPerp ? t('Spot') : t('Perp')}
              </div>
              <Button variant="outline" size="icon" onClick={() => setToPerp((prev) => !prev)}>
                <IconTransfer className="size-4" />
              </Button>
              <div className="flex-1 h-9 w-full flex items-center justify-center bg-white/10 text-accent-foreground rounded-md p-2 text-sm">
                {toPerp ? t('Perp') : t('Spot')}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div
                  className={cn(
                    'flex items-center justify-between text-xs text-white/70',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <p>{t('Amount')}</p>
                  <div className="flex items-center gap-1">
                    {t('Available to transfer:')}
                    <Button
                      variant="link"
                      onClick={() => setAmount(getBalance())}
                      className="text-xs h-fit p-0"
                    >
                      {getBalance()} {'USDC'}
                    </Button>
                  </div>
                </div>
                <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                  <Input
                    type="text"
                    id="amount"
                    className={cn('text-start flex-1 h-10', isRTL && 'text-end')}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled>
                      <Button
                        variant="outline"
                        className={cn('w-fit', isRTL && 'flex-row-reverse')}
                      >
                        USDC
                        <IconChevronDown className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            <Separator />
            {!address ? (
              <Button
                onClick={openConnectWalletModal}
                size={'sm'}
                className="flex items-center gap-2"
              >
                <IconWallet className="size-4" />
                <span className="font-semibold">{t('Connect Wallet')}</span>
              </Button>
            ) : !isAgentApproved || currentFeeApproval === 0 ? (
              <Button
                onClick={async () => openAgentModal()}
                className="w-full font-semibold cursor-pointer"
              >
                {' '}
                {t('Enable Trading')}
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={!amount || parseFloat(amount.toString()) === 0}
                onClick={onTransferClick}
              >
                {t('Transfer')}
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default SpotToPerpTransferModal
