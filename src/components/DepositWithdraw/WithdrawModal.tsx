import React, { useState } from 'react'
import { useConnection, useSwitchChain } from 'wagmi'
import { IconChevronDown } from '@tabler/icons-react'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { isTestnet, HYPERLIQUID_WITHDRAW_FEE_USDC } from '@/utils/constants'
import { DialogDescription, DialogContent, DialogTitle, DialogHeader, Dialog } from '../ui/dialog'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Input } from '../ui/input'
import { DropdownMenu, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'
import Loading from '../loading-screen'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
}

const WithdrawModal = ({ isOpen, onClose }: WithdrawModalProps) => {
  const { address, chainId } = useConnection()
  const [amount, setAmount] = useState<string>('')
  const { clearingHouseState, sdkUserSignerClient, addPendingWithdrawal } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState,
      sdkUserSignerClient: state.sdkUserSignerClient,
      addPendingWithdrawal: state.addPendingWithdrawal
    }))
  )
  const [isLoading, setIsLoading] = useState(false)
  const switchChain = useSwitchChain()
  const supportedChain = isTestnet ? 421614 : 42161
  const handleSwitchChain = async () => {
    const toastId = toast.loading('Switching to Arbitrum network...')
    await switchChain
      .mutateAsync({ chainId: supportedChain })
      .then(() => {
        toast.success('Switched to Arbitrum network.', {
          id: toastId
        })
      })
      .catch(() => {
        toast.error('Failed to switch to Arbitrum network.', {
          id: toastId
        })
      })
  }

  const onWithdrawClick = async () => {
    if (!chainId) return
    if (!sdkUserSignerClient) return
    if (!address) return
    const toastId = toast.loading('Signing in progress...')
    setIsLoading(true)
    try {
      await sdkUserSignerClient.withdraw3({
        amount: amount,
        destination: address
      })
      // Add to pending withdrawals for display in Deposits and Withdrawals tab
      const withdrawAmount = Number(amount)
      addPendingWithdrawal({
        amount: amount,
        displayAmount: (withdrawAmount - HYPERLIQUID_WITHDRAW_FEE_USDC).toString(),
        fee: HYPERLIQUID_WITHDRAW_FEE_USDC.toString(),
        timestamp: Date.now(),
        address: address
      })
      onClose()
      toast.success('Withdrawal confirmed.', {
        id: toastId
      })
    } catch (error) {
      setIsLoading(false)
      onClose()
      console.error('Error withdrawing:', error)
      toast.error('Something went wrong, check the console or contact support', {
        id: toastId
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{'Withdraw to Wallet'}</DialogTitle>
          <DialogDescription>
            {
              'USDC will be sent over the Arbitrum network to your address. A $1 USDC fee will be deducted from the withdrawal amount. Processing usually takes under 5 minutes.'
            }
          </DialogDescription>
        </DialogHeader>
        <Separator />
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-full">
            <Loading
              title={'Withdrawal in progress...'}
              subTitle={'You will need to sign this transaction in your wallet:'}
              className="py-[1rem] px-[1rem]"
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <p>{'Amount'}</p>
                  <div className="flex items-center gap-1">
                    {'Available to withdraw:'}
                    <Button
                      variant="link"
                      onClick={() => setAmount(clearingHouseState?.withdrawable.toString() ?? '0')}
                      className="text-xs h-fit p-0"
                    >
                      {clearingHouseState?.withdrawable} {'USDC'}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    id="amount"
                    className="text-start flex-1 h-10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled>
                      <Button variant="outline" className="w-fit">
                        USDC
                        <IconChevronDown className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            <Separator />

            {chainId !== supportedChain ? (
              <Button
                className="w-full"
                onClick={async () => {
                  await handleSwitchChain()
                }}
              >
                {'Switch to Arbitrum'}
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={!amount || parseFloat(amount.toString()) === 0}
                onClick={async () => {
                  await onWithdrawClick()
                }}
              >
                {'Withdraw'}
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default WithdrawModal
