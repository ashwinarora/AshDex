import React, { useState } from 'react'
import { useConnection, useSwitchChain } from 'wagmi'
import { IconChevronDown } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { toastSdkError } from '@/lib/toastSdkError'
import { validateAmount } from '@/lib/validate'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { usePerpTradingAccount } from '@/hooks/usePerpTradingAccount'
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
  const { sdkUserSignerClient, addPendingWithdrawal } = useHyperliquidStore(
    useShallow((state) => ({
      sdkUserSignerClient: state.sdkUserSignerClient,
      addPendingWithdrawal: state.addPendingWithdrawal
    }))
  )
  const withdrawable = usePerpTradingAccount().withdrawable
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
      toastSdkError(error, 'Withdrawal failed', { id: toastId })
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
                      onClick={() => setAmount(withdrawable.toString() ?? '0')}
                      className="text-xs h-fit p-0"
                    >
                      {withdrawable} {'USDC'}
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
                    data-testid="withdraw-amount"
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
                {/*
                  Preview the net-received amount so the user sees the effect
                  of the $1 fee before they sign. Hidden until they've typed
                  something valid — showing "$-1.00" for an empty field is
                  worse than showing nothing.
                */}
                {(() => {
                  const max = Number(withdrawable ?? 0)
                  const validity = validateAmount(amount, {
                    min: HYPERLIQUID_WITHDRAW_FEE_USDC + 0.01,
                    max
                  })
                  if (!amount) return null
                  const net = validity.ok
                    ? validity.value - HYPERLIQUID_WITHDRAW_FEE_USDC
                    : Number(amount) - HYPERLIQUID_WITHDRAW_FEE_USDC
                  const isNetPositive = Number.isFinite(net) && net > 0
                  return (
                    <p
                      className={cn('text-xs', isNetPositive ? 'text-white/70' : 'text-red')}
                      data-testid="withdraw-net-preview"
                    >
                      {isNetPositive
                        ? `You'll receive: $${net.toFixed(2)} USDC (after $${HYPERLIQUID_WITHDRAW_FEE_USDC} fee)`
                        : `Amount must be greater than the $${HYPERLIQUID_WITHDRAW_FEE_USDC} fee.`}
                    </p>
                  )
                })()}
              </div>
            </div>
            <Separator />

            {chainId !== supportedChain ? (
              <Button
                className="w-full"
                onClick={async () => {
                  await handleSwitchChain()
                }}
                data-testid="withdraw-switch-chain"
              >
                {'Switch to Arbitrum'}
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={
                  !validateAmount(amount, {
                    min: HYPERLIQUID_WITHDRAW_FEE_USDC + 0.01,
                    max: Number(withdrawable ?? 0)
                  }).ok
                }
                onClick={async () => {
                  await onWithdrawClick()
                }}
                data-testid="withdraw-submit"
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
