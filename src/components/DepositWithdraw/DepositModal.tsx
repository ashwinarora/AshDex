import { useEffect, useMemo, useState } from 'react'
import { useConnection, useReadContract, useSwitchChain, useWriteContract } from 'wagmi'
import { erc20Abi } from 'viem'
import {
  HYPERLIQUID_DEPOSIT,
  HYPERLIQUID_MIN_DEPOSIT_USDC,
  isTestnet,
  USDC_ARBITRUM
} from '@/utils/constants'
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
import { toastSdkError } from '@/lib/toastSdkError'
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
  // We keep the raw text the user typed as the source of truth so that
  // intermediate strings like "10." don't get round-tripped through
  // toHumanNumber/toRealNumber and lose the decimal point. bigint is derived
  // only when we need it (validation + submit).
  const [amountText, setAmountText] = useState('')
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

  // Reset the text field whenever the modal is (re-)opened so a stale value
  // from a prior attempt doesn't linger.
  useEffect(() => {
    if (isOpen || isDepositModalOpen) setAmountText('')
  }, [isOpen, isDepositModalOpen])

  const decimals = usdc?.decimals ?? 6

  // Turn the raw text into a bigint of USDC base units. Returns null when the
  // text is empty or unparseable so downstream checks can treat it as "no
  // valid amount yet".
  const amountBigInt = useMemo<bigint | null>(() => {
    const t = amountText.trim()
    if (!t) return null
    // A trailing decimal point ("10.") is valid *while typing* — treat it as
    // the integer part so the input can keep receiving keystrokes without
    // rejecting the "." itself.
    const normalized = t.endsWith('.') ? t.slice(0, -1) : t
    if (!/^\d+(\.\d+)?$/.test(normalized)) return null
    try {
      return toRealNumber(normalized, decimals)
    } catch {
      return null
    }
  }, [amountText, decimals])

  const minDepositBaseUnits = BigInt(HYPERLIQUID_MIN_DEPOSIT_USDC) * BigInt(10) ** BigInt(decimals)
  const isBelowMin = amountBigInt !== null && amountBigInt < minDepositBaseUnits
  const isOverBalance =
    amountBigInt !== null && balance !== undefined && amountBigInt > (balance ?? 0n)
  const isValidAmount = amountBigInt !== null && amountBigInt > 0n && !isBelowMin && !isOverBalance

  const handleAmountChange = (raw: string) => {
    // Allow only digits and a single decimal point. Anything else is silently
    // dropped (empty string, extra dots, letters, thousands commas, etc.).
    // Keeping this in text-space avoids the round-trip that used to swallow
    // the "." character.
    let cleaned = raw.replace(/[^\d.]/g, '')
    const firstDot = cleaned.indexOf('.')
    if (firstDot !== -1) {
      cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '')
    }
    // Clamp fractional digits to USDC's on-chain precision so the user can't
    // enter more precision than we can represent.
    if (firstDot !== -1) {
      const [i, f = ''] = cleaned.split('.')
      cleaned = `${i}.${f.slice(0, decimals)}`
    }
    setAmountText(cleaned)
  }

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
    if (chainId !== supportedChain) {
      await switchChain.mutateAsync({ chainId: supportedChain })
    }
    if (!usdc || amountBigInt === null || !isValidAmount) return
    const toastId = toast.loading('Deposit in progress...')
    try {
      setIsLoading(true)
      await writeContractAsync({
        address: usdc.address,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [HYPERLIQUID_DEPOSIT, amountBigInt]
      })
      setIsLoading(false)
      onClose?.()
      closeDepositModal()
      toast.success('Deposit confirmed. Balance will update on the next block.', {
        id: toastId
      })
    } catch (error) {
      // Route through the shared helper so wallet-side cancels ("user
      // rejected", EIP-1193 code 4001, viem UserRejectedRequestError) become
      // an info toast instead of a false-alarm "Deposit failed".
      setIsLoading(false)
      onClose?.()
      closeDepositModal()
      toastSdkError(error, 'Deposit failed. Please try again.', { id: toastId })
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
                      onClick={() => setAmountText(toHumanNumber(balance ?? 0n, decimals) ?? '')}
                      variant="link"
                      className="text-xs h-fit p-0"
                    >
                      {'Use Max'}: ({toHumanNumber(balance ?? 0n, decimals, 2)} {'USDC'})
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    id="amount"
                    className="text-start flex-1 h-10"
                    value={amountText}
                    onChange={(e) => handleAmountChange(e.target.value)}
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
                {amountBigInt !== null && amountBigInt > 0n && (
                  <p className="text-xs text-red-400">
                    {isBelowMin
                      ? `Minimum deposit is ${HYPERLIQUID_MIN_DEPOSIT_USDC} USDC. Hyperliquid drops sub-minimum deposits permanently.`
                      : isOverBalance
                        ? 'Amount exceeds your wallet balance.'
                        : null}
                  </p>
                )}
              </div>
            </div>
            <Separator />
            {chainId !== supportedChain ? (
              <Button className="w-full" onClick={handleSwitchChain}>
                {'Switch to Arbitrum'}
              </Button>
            ) : (
              <Button className="w-full" disabled={!isValidAmount} onClick={onDepositClick}>
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
