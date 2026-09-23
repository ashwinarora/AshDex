'use client'

import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { truncateAddress } from '@/utils/utils'
import { useWalletModal } from '@/context/WalletModalContext'
import { claimTestnetDrip, FAUCET_AMOUNT_USDC, type DripResult } from '@/utils/faucet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import HlToolsPromo from './HlToolsPromo'

interface FaucetModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Testnet-only faucet ("drip") dialog.
 *
 * The request is unsigned and always answered 200 by Hyperliquid, so the
 * flow is deliberately optimistic: we let the user fire it whatever their
 * state, then surface whichever refusal comes back. Nothing pre-warns about
 * the "already claimed" / "no mainnet account" rules — they're only knowable
 * server-side, and the returned message says exactly which one bit.
 */
const FaucetModal = ({ isOpen, onClose }: FaucetModalProps) => {
  const { address, isConnected } = useConnection()
  const { openConnectWalletModal } = useWalletModal()
  const [isClaiming, setIsClaiming] = useState(false)
  const [result, setResult] = useState<DripResult | null>(null)

  // Reopening should start clean rather than showing the previous attempt.
  useEffect(() => {
    if (isOpen) setResult(null)
  }, [isOpen])

  const onClaimClick = async () => {
    if (!address) return
    setIsClaiming(true)
    setResult(null)
    const toastId = toast.loading('Requesting testnet USDC...')
    try {
      const claim = await claimTestnetDrip(address)
      setResult(claim)
      if (claim.ok) {
        toast.success(`${FAUCET_AMOUNT_USDC} mock USDC is on its way.`, { id: toastId })
      } else {
        toast.error(claim.message, { id: toastId })
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not reach the faucet. Try again.'
      setResult({ ok: false, reason: 'unknown', message })
      toast.error(message, { id: toastId })
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} data-testid="faucet-modal">
        <DialogHeader>
          <DialogTitle>{'Testnet Faucet'}</DialogTitle>
          <DialogDescription>
            {`Claim ${FAUCET_AMOUNT_USDC.toLocaleString()} mock USDC on Hyperliquid testnet. Funds land in your perps account within a few seconds.`}
          </DialogDescription>
        </DialogHeader>
        <Separator />

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70">{'Claiming to'}</span>
            <span className="font-medium text-white" data-testid="faucet-address">
              {address ? truncateAddress(address) : 'No wallet connected'}
            </span>
          </div>

          {result && (
            <div
              className={cn(
                'flex gap-2 rounded-md border p-3 text-xs',
                result.ok
                  ? 'border-green/30 bg-green/10 text-green'
                  : 'border-red/30 bg-red/10 text-red'
              )}
              role="status"
              data-testid={result.ok ? 'faucet-success' : 'faucet-error'}
            >
              {result.ok ? (
                <IconCircleCheck className="size-4 shrink-0" />
              ) : (
                <IconAlertTriangle className="size-4 shrink-0" />
              )}
              <span>
                {result.ok
                  ? `Claimed. ${FAUCET_AMOUNT_USDC.toLocaleString()} mock USDC should appear in your balance shortly.`
                  : result.message}
              </span>
            </div>
          )}

          {isConnected && address ? (
            <Button
              className="w-full"
              disabled={isClaiming}
              onClick={onClaimClick}
              data-testid="faucet-claim"
            >
              {isClaiming ? 'Claiming...' : `Claim ${FAUCET_AMOUNT_USDC.toLocaleString()} USDC`}
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={() => {
                onClose()
                // Radix tears down this dialog's focus + pointer-event guards
                // on unmount, and they'd suppress a wallet modal opened in the
                // same tick. Hand off after the teardown paints.
                requestAnimationFrame(() => openConnectWalletModal())
              }}
              data-testid="faucet-connect"
            >
              {'Connect Wallet'}
            </Button>
          )}
        </div>

        <Separator />

        {/*
          Always visible, claimed or not: the faucet is a single 1000 USDC
          drop, so anyone who opens this dialog is short on testnet funds.
        */}
        <HlToolsPromo />
      </DialogContent>
    </Dialog>
  )
}

export default FaucetModal
