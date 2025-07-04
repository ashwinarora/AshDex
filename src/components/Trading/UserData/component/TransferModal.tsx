import { useState } from 'react'
import { useAccount, useSignTypedData } from 'wagmi'
import { getUsdClassTransferPayload } from '@/utils/hyperliquid/UsdClassTransfer'
import { splitSignature } from '@/utils/utils'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { hyperliquidAxios } from '@/config/axios'
import { isTestnet } from '@/utils/constants'
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

interface ITransferModal {
  isOpen: boolean
  onClose: () => void
}

const TransferModal = ({ isOpen, onClose }: ITransferModal) => {
  const { chainId } = useAccount()
  const [amount, setAmount] = useState<string>('')
  const [toPerp, setToPerp] = useState(false)
  const { clearingHouseState, spotState } = useHyperliquid()
  const [isLoading, setIsLoading] = useState(false)
  const { signTypedDataAsync } = useSignTypedData()

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
    const toastId = toast.loading('Transferring...')
    try {
      setIsLoading(true)
      const payload = getUsdClassTransferPayload({
        chainId: chainId,
        isTestnet: isTestnet,
        amount: amount,
        toPerp: toPerp,
        nonce: Date.now()
      })
      const sign = await signTypedDataAsync(payload)
      const body = {
        action: {
          type: payload.message.type,
          amount: payload.message.amount,
          toPerp: payload.message.toPerp,
          nonce: payload.message.nonce,
          signatureChainId: payload.message.signatureChainId,
          hyperliquidChain: payload.message.hyperliquidChain
        },
        nonce: payload.message.nonce,
        signature: splitSignature(sign)
      }
      const res = await hyperliquidAxios.post('/exchange', body)
      console.log('Transfer response:', res.data)
      onClose()
      toast.success('Transfer successful', {
        id: toastId
      })
      setIsLoading(false)
    } catch (error) {
      console.error('Transfer failed:', error)
      onClose()
      toast.error('Transfer failed', {
        id: toastId
      })
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer between Perp and Spot</DialogTitle>
          <DialogDescription>Transfer USDC between Perp and Spot.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-full">
            <Loading
              title={'Transfer in progress…'}
              subTitle={'You will need to sign this transaction in your wallet:'}
              className="py-[1rem] px-[1rem]"
            />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 justify-between">
              <div className="flex-1 h-9 w-full flex items-center justify-center bg-accent text-accent-foreground rounded-md p-2 text-sm">
                {toPerp ? 'Perp' : 'Spot'}
              </div>
              <Button variant="outline" size="icon" onClick={() => setToPerp((prev) => !prev)}>
                <IconTransfer className="size-4" />
              </Button>
              <div className="flex-1 h-9 w-full flex items-center justify-center bg-accent text-accent-foreground rounded-md p-2 text-sm">
                {toPerp ? 'Spot' : 'Perp'}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <p>Amount</p>
                  <div className="flex items-center gap-1">
                    Available to transfer:
                    <Button
                      variant="link"
                      onClick={() => setAmount(getBalance())}
                      className="text-xs h-fit p-0"
                    >
                      {getBalance()} {'USDC'}
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
            <Button
              className="w-full"
              disabled={!amount || parseFloat(amount.toString()) === 0}
              onClick={onTransferClick}
            >
              Transfer
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default TransferModal
