import { useState } from 'react'
import { useAccount, useBalance, useSendTransaction, useSignTypedData, useSwitchChain } from 'wagmi'
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
import { isTestnet } from '@/utils/constants'
import { hyperliquidAxios } from '@/config/axios'
import { splitSignature } from '@/utils/utils'
import { getSpotToEVMSendPayload } from '@/utils/hyperliquid/Transfer'
import { hyperliquidMainnet, hyperliquidTestnet } from '@/config/wagmi'
import { formatUnits, parseUnits } from 'viem'

interface ITransferModal {
  isOpen: boolean
  onClose: () => void
}

const SpotToEvmTransferModal = ({ isOpen, onClose }: ITransferModal) => {
  const { chainId, address } = useAccount()
  const { data: balance } = useBalance({
    address: address,
    chainId: isTestnet ? hyperliquidTestnet.id : hyperliquidMainnet.id,
  })
  const { switchChainAsync } = useSwitchChain()

  const [amount, setAmount] = useState<string>('')
  const [toEvm, setToEvm] = useState(false)
  const { spotState } = useHyperliquidStore(
    useShallow((state) => ({
      spotState: state.spotState
    }))
  )

  const { sendTransactionAsync } = useSendTransaction()

  const [isLoading, setIsLoading] = useState(false)
  const { signTypedDataAsync } = useSignTypedData()

  const getBalance = () => {
    if (toEvm) {
      return (
        spotState?.balances?.find((balance) => balance.coin === 'HYPE')?.total.toString() ?? '0'
      )
    } else {
      return parseFloat(formatUnits(balance?.value ?? 0n, balance?.decimals ?? 18)).toFixed(4)
    }
  }

  const switchChain = async () => {
    const toastId = toast.loading('Switching to Hyperliquid network…')
    await switchChainAsync({ chainId: isTestnet ? hyperliquidTestnet.id : hyperliquidMainnet.id })
      .then(() => {
        toast.success('Switched to Hyperliquid network.', {
          id: toastId
        })
      })
      .catch(() => {
        toast.error('Failed to switch to Hyperliquid network.', {
          id: toastId
        })
      })
  }

  const onTransferClick = async () => {
    if (toEvm) {
      if (!chainId) return
      const toastId = toast.loading('Transferring...')
      try {
        setIsLoading(true)
        const payload = getSpotToEVMSendPayload({
          chainId: chainId,
          isTestnet: isTestnet,
          amount: amount
        })
        const sign = await signTypedDataAsync(payload)
        const body = {
          action: {
            amount: payload.message.amount,
            destination: payload.message.destination,
            hyperliquidChain: payload.message.hyperliquidChain,
            signatureChainId: payload.message.signatureChainId,
            time: payload.message.time,
            token: payload.message.token,
            type: payload.message.type
          },
          isFrontend: true,
          nonce: payload.message.time,
          signature: splitSignature(sign),
          vaultAddress: null
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
    } else {
      if (!chainId || chainId !== hyperliquidMainnet.id && chainId !== hyperliquidTestnet.id) return
      const toastId = toast.loading('Transferring...')
      try {
        setIsLoading(true)
        const res = await sendTransactionAsync({
          to: '0x2222222222222222222222222222222222222222',
          value: parseUnits(amount, 18),
          chainId: isTestnet ? hyperliquidTestnet.id : hyperliquidMainnet.id
        })
        console.log('Transfer response:', res)
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
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer between Spot and EVM</DialogTitle>
          <DialogDescription>Transfer HYPE between Spot and EVM.</DialogDescription>
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
                {toEvm ? 'Spot' : 'EVM'}
              </div>
              <Button variant="outline" size="icon" onClick={() => setToEvm((prev) => !prev)}>
                <IconTransfer className="size-4" />
              </Button>
              <div className="flex-1 h-9 w-full flex items-center justify-center bg-accent text-accent-foreground rounded-md p-2 text-sm">
                {toEvm ? 'EVM' : 'Spot'}
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
                      onClick={() => setAmount(getBalance() ?? '0')}
                      className="text-xs h-fit p-0"
                    >
                      {getBalance()} {'HYPE'}
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
                        HYPE
                        <IconChevronDown className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            <Separator />
            {!toEvm ? chainId !== hyperliquidMainnet.id && chainId !== hyperliquidTestnet.id ? <Button
              className="w-full"
              onClick={switchChain}
            >
              Switch to Hyperliquid Network
            </Button> : <Button
              className="w-full"
              disabled={!amount || parseFloat(amount.toString()) === 0}
              onClick={onTransferClick}
            >
              Transfer to Spot
            </Button> : <Button
              className="w-full"
              disabled={!amount || parseFloat(amount.toString()) === 0}
              onClick={onTransferClick}
            >
              Transfer to EVM
            </Button>}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default SpotToEvmTransferModal
