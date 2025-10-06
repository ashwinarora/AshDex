import { useState } from 'react'
import { useAccount, useReadContract, useSwitchChain, useWriteContract } from 'wagmi'
import { erc20Abi } from 'viem'
import { HYPERLIQUID_DEPOSIT, isTestnet, USDC_ARBITRUM } from '@/utils/constants'
import { useERC20Data } from '@/hooks/useERC20Data'
import { toHumanNumber, toRealNumber } from '@/utils/utils'
import { IconChevronDown } from '@tabler/icons-react'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogDescription } from '../ui/dialog'
import { Input } from '../ui/input'
import { DropdownMenu, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import Loading from '../common/Loading'
import { toast } from 'sonner'
import { useTranslate } from '@tolgee/react'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/userStore'
import { useAgentApproval } from '@/context/EstablishConnection'

interface DepositModalProps {
  isOpen?: boolean
  onClose?: () => void
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslate()
  const { address, chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { closeDepositModal, isDepositModalOpen } = useAgentApproval()
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState<bigint>(0n)
  const { data: usdc } = useERC20Data(USDC_ARBITRUM)
  const { data: balance } = useReadContract({
    address: USDC_ARBITRUM,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address || '0x'],
    query: {
      enabled: !!address
    }
  })
  const { writeContractAsync } = useWriteContract()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
  const supportedChain = isTestnet ? 421614 : 42161

  const switchChain = async () => {
    const toastId = toast.loading(t('Switching to Arbitrum network...'))
    await switchChainAsync({ chainId: supportedChain })
      .then(() => {
        toast.success(t('Switched to Arbitrum network.'), {
          id: toastId
        })
      })
      .catch(() => {
        toast.error(t('Failed to switch to Arbitrum network.'), {
          id: toastId
        })
      })
  }

  const onDepositClick = async () => {
    if (chainId !== 42161) {
      await switchChainAsync({ chainId: 42161 })
    }
    if (!usdc) return
    const toastId = toast.loading(t('Deposit in progress...'))
    try {
      setIsLoading(true)
      await writeContractAsync({
        address: usdc.address,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [HYPERLIQUID_DEPOSIT, amount]
      })
      setIsLoading(false)
      onClose?.()
      closeDepositModal()
      toast.success(t('Deposit confirmed. Balance will update on the next block.'), {
        id: toastId
      })
    } catch (error) {
      console.error('Deposit error:', error)
      onClose?.()
      closeDepositModal()
      toast.error(t('Deposit failed. Please try again.'), {
        id: toastId
      })
    }
  }

  return (
    <Dialog open={isOpen || isDepositModalOpen} onOpenChange={onClose || closeDepositModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Deposit to Nexon')}</DialogTitle>
          <DialogDescription>{t('Deposit USDC from Arbitrum to Nexon')}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-full">
            <Loading
              title={t('Deposit in progress…')}
              subTitle={t('You will need to sign this transaction in your wallet:')}
              className="py-[1rem] px-[1rem]"
            />
          </div>
        ) : (
          <>
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
                    <Button
                      onClick={() => setAmount(balance ?? 0n)}
                      variant="link"
                      className="text-xs h-fit p-0"
                    >
                      {t('Use Max')}: ({toHumanNumber(balance ?? 0n, usdc?.decimals, 2)} {'USDC'})
                    </Button>
                  </div>
                </div>
                <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                  <Input
                    type="text"
                    id="amount"
                    className={cn('text-start flex-1 h-10', isRTL && 'text-end')}
                    value={toHumanNumber(amount, usdc?.decimals, 2) || ''}
                    onChange={(e) => setAmount(toRealNumber(e.target.value, usdc?.decimals))}
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
              <Button className="w-full" onClick={switchChain}>
                {t('Switch to Arbitrum')}
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={!amount || parseFloat(amount.toString()) === 0}
                onClick={onDepositClick}
              >
                {t('Deposit')}
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
export default DepositModal
