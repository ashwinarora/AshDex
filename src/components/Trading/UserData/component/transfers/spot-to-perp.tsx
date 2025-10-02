import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { toast } from 'sonner'
import { IconChevronDown, IconTransfer } from '@tabler/icons-react'
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DialogDescription } from '@/components/ui/dialog'
import { DialogTitle } from '@/components/ui/dialog'
import { DialogHeader } from '@/components/ui/dialog'
import { DialogContent } from '@/components/ui/dialog'
import { Dialog } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import Loading from '@/components/common/Loading'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { ApiRequestError } from '@nktkas/hyperliquid'
import { useTranslate } from '@tolgee/react'
import { useAgentApproval } from '@/context/EstablishConnection'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/userStore'

interface ITransferModal {
  isOpen: boolean
  onClose: () => void
  defaultToPerp?: boolean
}

const SpotToPerpTransferModal = ({ isOpen, onClose, defaultToPerp }: ITransferModal) => {
  const { chainId } = useAccount()
  const { t } = useTranslate()
  const [amount, setAmount] = useState<string>('')
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
      return (
        spotState?.balances?.find((balance) => balance.coin === 'USDC')?.total.toString() ?? '0'
      )
    } else {
      return clearingHouseState?.withdrawable.toString() ?? '0'
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
      if (error instanceof ApiRequestError) {
        toast.error(`${t('Transfer failed.')} ${error.message}`, {
          id: toastId
        })
      } else {
        toast.error(t('Transfer failed.'), {
          id: toastId
        })
      }
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Transfer between Perp and Spot')}</DialogTitle>
          <DialogDescription>{t('Transfer USDC between Perp and Spot.')}</DialogDescription>
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
              <div className="flex-1 h-9 w-full flex items-center justify-center bg-accent text-accent-foreground rounded-md p-2 text-sm">
                {toPerp ? t('Spot') : t('Perp')}
              </div>
              <Button variant="outline" size="icon" onClick={() => setToPerp((prev) => !prev)}>
                <IconTransfer className="size-4" />
              </Button>
              <div className="flex-1 h-9 w-full flex items-center justify-center bg-accent text-accent-foreground rounded-md p-2 text-sm">
                {toPerp ? t('Perp') : t('Spot')}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div
                  className={cn(
                    'flex items-center justify-between text-xs text-white/50',
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
            {!isAgentApproved || currentFeeApproval === 0 ? (
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
