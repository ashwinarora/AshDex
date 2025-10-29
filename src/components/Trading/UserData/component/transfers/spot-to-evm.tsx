import { useState } from 'react'
import { useAccount, useBalance, useSendTransaction, useSwitchChain, useWriteContract } from 'wagmi'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { toast } from 'sonner'
import { IconChevronDown, IconTransfer } from '@tabler/icons-react'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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
import { CORE_TO_EVM_MAPPING, isTestnet } from '@/utils/constants'
import { hyperliquidMainnet, hyperliquidTestnet } from '@/config/wagmi'
import { erc20Abi, formatUnits, isAddress, parseUnits } from 'viem'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiRequestError } from '@nktkas/hyperliquid'
import { useTranslate } from '@tolgee/react'
import useUserStore from '@/store/userStore'
import { cn } from '@/lib/utils'

interface ITransferModal {
  isOpen: boolean
  onClose: () => void
}

const SpotToEvmTransferModal = ({ isOpen, onClose }: ITransferModal) => {
  const { chainId, address } = useAccount()
  const { t } = useTranslate()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')

  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()

  const [amount, setAmount] = useState<string>('')
  const [toEvm, setToEvm] = useState(false)
  const { spotState, sdkUserSignerClient } = useHyperliquidStore(
    useShallow((state) => ({
      spotState: state.spotState,
      sdkUserSignerClient: state.sdkUserSignerClient
    }))
  )
  const [coin, setCoin] = useState<string>('HYPE')

  const supportedCoins = Object.keys(CORE_TO_EVM_MAPPING[isTestnet ? 'testnet' : 'mainnet'])
  const { destination, token, onChainAddress } =
    CORE_TO_EVM_MAPPING[isTestnet ? 'testnet' : 'mainnet'][coin]

  const { data: balanceEvm, isLoading: isLoadingBalanceEvm } = useBalance({
    address: address,
    chainId: isTestnet ? hyperliquidTestnet.id : hyperliquidMainnet.id
  })

  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    address: address,
    chainId: isTestnet ? hyperliquidTestnet.id : hyperliquidMainnet.id,
    token: onChainAddress as `0x${string}`,
    query: {
      enabled: !!onChainAddress && !!address
    }
  })

  const { sendTransactionAsync } = useSendTransaction()

  const [isLoading, setIsLoading] = useState(false)

  const getBalance = () => {
    if (toEvm) {
      return parseFloat(
        spotState?.balances?.find((balance) => balance.coin === coin)?.total.toString() ?? '0'
      ).toFixed(4)
    } else {
      if (coin === 'HYPE') {
        return parseFloat(formatUnits(balanceEvm?.value ?? 0n, balanceEvm?.decimals ?? 18)).toFixed(
          4
        )
      }
      return parseFloat(formatUnits(balance?.value ?? 0n, balance?.decimals ?? 18)).toFixed(4)
    }
  }

  const switchChain = async () => {
    const toastId = toast.loading(t('Switching to Hyperliquid network...'))
    await switchChainAsync({ chainId: isTestnet ? hyperliquidTestnet.id : hyperliquidMainnet.id })
      .then(() => {
        toast.success(t('Switched to Hyperliquid network.'), {
          id: toastId
        })
      })
      .catch(() => {
        toast.error(t('Failed to switch to Hyperliquid network.'), {
          id: toastId
        })
      })
  }

  const onTransferClick = async () => {
    if (toEvm) {
      if (!chainId) return
      if (!sdkUserSignerClient) return
      if (!isAddress(destination)) return
      const toastId = toast.loading(t('Transferring...'))
      try {
        setIsLoading(true)
        const res = await sdkUserSignerClient.spotSend({
          destination: destination,
          amount: amount,
          token: token
        })
        console.log('Transfer response:', res)
        onClose()
        toast.success(t('Transfer successful'), {
          id: toastId
        })
        setIsLoading(false)
      } catch (error) {
        console.error('Transfer failed:', error)
        onClose()
        setIsLoading(false)
        if (error instanceof ApiRequestError) {
          toast.error(`${t('Transfer failed.')} ${error.message}`, {
            id: toastId
          })
        } else {
          toast.error(t('Transfer failed.'), {
            id: toastId
          })
        }
      }
    } else {
      if (!chainId || (chainId !== hyperliquidMainnet.id && chainId !== hyperliquidTestnet.id))
        return
      const toastId = toast.loading(t('Transferring...'))
      try {
        setIsLoading(true)
        let res
        if (coin === 'HYPE') {
          res = await sendTransactionAsync({
            to: destination as `0x${string}`,
            value: parseUnits(amount, 18),
            chainId: isTestnet ? hyperliquidTestnet.id : hyperliquidMainnet.id
          })
        } else {
          res = await writeContractAsync({
            abi: erc20Abi,
            address: onChainAddress as `0x${string}`,
            functionName: 'transfer',
            args: [destination as `0x${string}`, parseUnits(amount, 18)],
            chainId: isTestnet ? hyperliquidTestnet.id : hyperliquidMainnet.id
          })
        }
        console.log('Transfer response:', res)
        onClose()
        toast.success(t('Transfer successful'), {
          id: toastId
        })
        setIsLoading(false)
      } catch (error) {
        console.error('Transfer failed:', error)
        onClose()
        toast.error(t('Transfer failed.'), {
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
          <DialogTitle>{t('Transfer between Spot and EVM')}</DialogTitle>
          <DialogDescription>
            {isRTL
              ? `تحويل ${coin} بين المحفظة الفعلية وشبكة أي في أم.`
              : `Transfer ${coin} between Spot and EVM.`}
          </DialogDescription>
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
                {toEvm ? t('Spot') : t('EVM')}
              </div>
              <Button variant="outline" size="icon" onClick={() => setToEvm((prev) => !prev)}>
                <IconTransfer className="size-4" />
              </Button>
              <div className="flex-1 h-9 w-full flex items-center justify-center bg-accent text-accent-foreground rounded-md p-2 text-sm">
                {toEvm ? t('EVM') : t('Spot')}
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
                    {isLoadingBalanceEvm || isLoadingBalance ? (
                      <Skeleton className="w-20 h-4 rounded-md" />
                    ) : (
                      <Button
                        variant="link"
                        onClick={() => setAmount(getBalance() ?? '0')}
                        className="text-xs h-fit p-0"
                      >
                        {getBalance()} {coin}
                      </Button>
                    )}
                  </div>
                </div>
                <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                  <Input
                    type="text"
                    id="amount"
                    className={cn('text-start flex-1 !text-xs h-10', isRTL && 'text-end')}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className={cn('w-20', isRTL && 'flex-row-reverse')}>
                        {coin}
                        <IconChevronDown className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-20">
                      {supportedCoins.map((coin) => (
                        <DropdownMenuItem key={coin} onClick={() => setCoin(coin)}>
                          {coin}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            <Separator />
            {!toEvm ? (
              chainId !== hyperliquidMainnet.id && chainId !== hyperliquidTestnet.id ? (
                <Button className="w-full" onClick={switchChain}>
                  {t('Switch to Hyperliquid Network')}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  disabled={!amount || parseFloat(amount.toString()) === 0}
                  onClick={onTransferClick}
                >
                  {t('Transfer to Spot')}
                </Button>
              )
            ) : (
              <Button
                className="w-full"
                disabled={!amount || parseFloat(amount.toString()) === 0}
                onClick={onTransferClick}
              >
                {t('Transfer to EVM')}
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default SpotToEvmTransferModal
