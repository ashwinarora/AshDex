import { useState } from 'react'
import { useConnection, useReadContract, useSwitchChain, useWriteContract } from 'wagmi'
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
import Loading from '../loading-screen'
import { toast } from 'sonner'
import { useAgentApproval } from '@/context/EstablishConnection'

interface DepositModalProps {
  isOpen?: boolean
  onClose?: () => void
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { address, chainId } = useConnection()
  const switchChain = useSwitchChain()
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
  const supportedChain = isTestnet ? 421614 : 42161

  const handleSwitchChain = async () => {
    const toastId = toast.loading('Switching to Arbitrum network...')
    try {
      await switchChain.mutateAsync({ chainId: supportedChain })
      toast.success('Switched to Arbitrum network.', { id: toastId })
    } catch {
      // R1-B1: `wallet_switchEthereumChain` alone fails when the target
      // chain isn't already configured in the wallet (Rabby's default for
      // Arbitrum Sepolia is to prompt for a full add-network dialog).
      // Fall back to `wallet_addEthereumChain` per EIP-3085, which upserts
      // and switches in one round-trip.
      try {
        const provider = (
          globalThis as unknown as {
            ethereum?: {
              request: (args: { method: string; params?: unknown }) => Promise<unknown>
            }
          }
        ).ethereum
        if (!provider) throw new Error('No injected wallet')
        const params = isTestnet
          ? {
              chainId: '0x66eee', // 421614
              chainName: 'Arbitrum Sepolia',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
              blockExplorerUrls: ['https://sepolia.arbiscan.io']
            }
          : {
              chainId: '0xa4b1', // 42161
              chainName: 'Arbitrum One',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://arb1.arbitrum.io/rpc'],
              blockExplorerUrls: ['https://arbiscan.io']
            }
        await provider.request({ method: 'wallet_addEthereumChain', params: [params] })
        toast.success('Switched to Arbitrum network.', { id: toastId })
      } catch {
        toast.error('Failed to switch to Arbitrum network.', { id: toastId })
      }
    }
  }

  const onDepositClick = async () => {
    if (chainId !== 42161) {
      await switchChain.mutateAsync({ chainId: 42161 })
    }
    if (!usdc) return
    const toastId = toast.loading('Deposit in progress...')
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
      toast.success('Deposit confirmed. Balance will update on the next block.', {
        id: toastId
      })
    } catch (error) {
      console.error('Deposit error:', error)
      onClose?.()
      closeDepositModal()
      toast.error('Deposit failed. Please try again.', {
        id: toastId
      })
    }
  }

  return (
    <Dialog open={isOpen || isDepositModalOpen} onOpenChange={onClose || closeDepositModal}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{'Deposit to AshDex'}</DialogTitle>
          <DialogDescription>{'Deposit USDC from Arbitrum to AshDex'}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-full">
            <Loading
              title={'Deposit in progress...'}
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
                    <Button
                      onClick={() => setAmount(balance ?? 0n)}
                      variant="link"
                      className="text-xs h-fit p-0"
                    >
                      {'Use Max'}: ({toHumanNumber(balance ?? 0n, usdc?.decimals, 2)} {'USDC'})
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    id="amount"
                    className="text-start flex-1 h-10"
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
              <Button className="w-full" onClick={handleSwitchChain}>
                {'Switch to Arbitrum'}
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={!amount || parseFloat(amount.toString()) === 0}
                onClick={onDepositClick}
              >
                {'Deposit'}
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
export default DepositModal
