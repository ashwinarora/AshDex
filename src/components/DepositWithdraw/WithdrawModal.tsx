import React, { useState } from 'react'
import { useAccount, useSignTypedData, useSwitchChain } from 'wagmi'
import { IconChevronDown } from '@tabler/icons-react'
import { getWithrawalPayload } from '@/utils/hyperliquid/Withdraw'
import { splitSignature } from '@/utils/utils'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { hyperliquidAxios } from '@/config/axios'
import { isTestnet } from '@/utils/constants'
import Loading from '../common/Loading'
import { DialogDescription, DialogContent, DialogTitle, DialogHeader, Dialog } from '../ui/dialog'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Input } from '../ui/input'
import { DropdownMenu, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
}

const WithdrawModal = ({ isOpen, onClose }: WithdrawModalProps) => {
  const { address, chainId } = useAccount()

  const [amount, setAmount] = useState<string>('')
  const { clearingHouseState } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState
    }))
  )
  const { signTypedDataAsync } = useSignTypedData()
  const [isLoading, setIsLoading] = useState(false)
  const { switchChainAsync } = useSwitchChain()
  const supportedChain = isTestnet ? 421614 : 42161

  const switchChain = async () => {
    const toastId = toast.loading('Switching to Arbitrum network…')
    await switchChainAsync({ chainId: supportedChain })
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
    if (!address) return
    const toastId = toast.loading('Signing in progress…')
    try {
      const payload = getWithrawalPayload({
        chainId: chainId,
        isTestnet: isTestnet,
        amount: amount,
        destination: address,
        nonce: Date.now()
      })
      const sign = await signTypedDataAsync(payload)
      setIsLoading(true)
      toast.loading('Withdrawal in progress…', {
        id: toastId
      })
      const body = {
        action: {
          type: payload.message.type,
          amount: payload.message.amount,
          destination: payload.message.destination,
          time: payload.message.time,
          signatureChainId: payload.message.signatureChainId,
          hyperliquidChain: payload.message.hyperliquidChain
        },
        nonce: payload.message.time,
        signature: splitSignature(sign)
      }
      const res = await hyperliquidAxios.post('/exchange', body)
      console.log('Withdraw response:', res)
      onClose()
      toast.success('Withdrawal confirmed.', {
        id: toastId
      })
    } catch (error) {
      onClose()
      console.error('Error withdrawing:', error)
      toast.error('Withdrawal failed. Please try again.', {
        id: toastId
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw to Wallet</DialogTitle>
          <DialogDescription>
            USDC will be sent over the Arbitrum network to your address. A 5 USDC fee will be
            deducted from the withdrawal amount. Processing usually takes under 5 minutes.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-full">
            <Loading
              title={'Withdrawal in progress…'}
              subTitle={'You will need to sign this transaction in your wallet:'}
              className="py-[1rem] px-[1rem]"
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <p>Amount</p>
                  <div className="flex items-center gap-1">
                    Available to withdraw:
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
                    className="text-left flex-1 h-10"
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
                  await switchChain()
                }}
              >
                Switch to Arbitrum
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={!amount || parseFloat(amount.toString()) === 0}
                onClick={async () => {
                  await onWithdrawClick()
                }}
              >
                Withdraw
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default WithdrawModal
