'use client'
import { useEffect, useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { toast } from 'sonner'
import type { Hex } from 'viem'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import {
  useHyperliquidStore,
  useAccountAbstraction,
  type AccountAbstractionMode
} from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { toastSdkError } from '@/lib/toastSdkError'

interface AccountTypeModalProps {
  isOpen: boolean
  onClose: () => void
}

type Option = {
  value: AccountAbstractionMode
  label: string
  description: string
}

// Mirrors the copy Hyperliquid shows on their own Account Type dialog so users
// switching from hyperliquid.xyz to AshDex see the same tradeoffs framed the
// same way.
const OPTIONS: Option[] = [
  {
    value: 'unifiedAccount',
    label: 'Unified Account (Recommended)',
    description:
      'Single balance per collateral asset, shared across spot trading and cross-margin perp positions with the same collateral. Recommended for most users.'
  },
  {
    value: 'portfolioMargin',
    label: 'Portfolio Margin',
    description:
      'Advanced: all eligible assets (HYPE, BTC, USDC, USDT) unified into one collateral pool. Highest capital efficiency. Beta: account value must be under $25M and above the eligibility threshold.'
  },
  {
    value: 'disabled',
    label: 'Manual',
    description:
      'Separate perp and spot balances, cross margin applies per DEX. Recommended for market makers, high-volume automated traders, and deployers.'
  }
]

const AccountTypeModal = ({ isOpen, onClose }: AccountTypeModalProps) => {
  const { address } = useConnection()
  const current = useAccountAbstraction()
  const { sdkUserSignerClient, fetchUserAbstraction } = useHyperliquidStore(
    useShallow((state) => ({
      sdkUserSignerClient: state.sdkUserSignerClient,
      fetchUserAbstraction: state.fetchUserAbstraction
    }))
  )
  const [selected, setSelected] = useState<AccountAbstractionMode>(current ?? 'unifiedAccount')
  const [isPending, setIsPending] = useState(false)

  // Reset the radio to the live-fetched mode every time the dialog reopens.
  useEffect(() => {
    if (isOpen && current) setSelected(current)
  }, [isOpen, current])

  const isDirty = useMemo(() => selected !== current, [selected, current])

  const handleConfirm = async () => {
    if (!sdkUserSignerClient || !address) return
    if (!isDirty) {
      onClose()
      return
    }
    const toastId = toast.loading('Signing account type change…')
    setIsPending(true)
    try {
      await sdkUserSignerClient.userSetAbstraction({
        user: address as Hex,
        abstraction: selected
      })
      // Re-read the mode from the API so the mode chip, hidden widgets, and
      // trading form all pivot immediately.
      await fetchUserAbstraction(address as Hex)
      toast.success('Account type updated', { id: toastId })
      onClose()
    } catch (error) {
      // Common failure: L1 rejects portfolio-margin switches when the account
      // has open positions/orders. `toastSdkError` surfaces the L1 message.
      toastSdkError(error, 'Failed to update account type', { id: toastId })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent
        className="max-w-lg"
        onOpenAutoFocus={(e) => e.preventDefault()}
        data-testid="account-type-modal"
      >
        <DialogHeader>
          <DialogTitle>{'Account Type'}</DialogTitle>
          <DialogDescription>
            {'Controls how spot and perp balances share collateral. Requires a wallet signature.'}
          </DialogDescription>
        </DialogHeader>
        <RadioGroup
          value={selected}
          onValueChange={(value) => setSelected(value as AccountAbstractionMode)}
          className="flex flex-col gap-3"
        >
          {OPTIONS.map((option) => (
            <label
              key={option.value}
              htmlFor={`account-type-${option.value}`}
              className={cn(
                'flex items-start gap-3 rounded-md border border-white/10 p-3 cursor-pointer transition-colors',
                selected === option.value ? 'border-primary bg-primary/10' : 'hover:border-white/30'
              )}
            >
              <RadioGroupItem
                id={`account-type-${option.value}`}
                value={option.value}
                className="mt-1"
              />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-white">{option.label}</span>
                <span className="text-xs text-white/70">{option.description}</span>
              </div>
            </label>
          ))}
        </RadioGroup>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {'Cancel'}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || !sdkUserSignerClient || !address}
            data-testid="account-type-confirm"
          >
            {isPending ? 'Signing…' : isDirty ? 'Confirm' : 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AccountTypeModal
