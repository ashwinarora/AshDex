'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { IconCheckbox, IconSquare } from '@tabler/icons-react'
import { useOutcomesUIStore } from '@/store/OutcomesUIStore'
import { useRouter } from 'next/navigation'

/**
 * One-time acknowledgement for markets deployed permissionlessly by a third
 * party venue (HIP-4). Never shown for Hyperliquid-native markets. Persisted
 * per venue in OutcomesUIStore.
 */
const DeployerDisclaimerModal = ({ venue }: { venue: string | null }) => {
  const router = useRouter()
  const { acknowledgedVenues, acknowledgeVenue } = useOutcomesUIStore()
  const [checked, setChecked] = useState(false)
  const open = !!venue && !acknowledgedVenues.has(venue)
  if (!venue) return null
  return (
    <Dialog open={open} onOpenChange={(o) => !o && router.push('/outcomes')}>
      <DialogContent
        className="bg-surface-1 border-surface-3 max-w-lg"
        data-testid="deployer-disclaimer"
      >
        <DialogHeader>
          <DialogTitle className="text-text-1">HIP-4 Deployer Disclaimer</DialogTitle>
          <DialogDescription className="text-text-2 text-xs leading-relaxed">
            You are viewing outcome markets deployed independently and permissionlessly by a third
            party (&ldquo;{venue}&rdquo;) on Hyperliquid. These markets are surfaced based on
            on-chain activity and are not reviewed, verified, or approved by AshDex or Hyperliquid.
          </DialogDescription>
        </DialogHeader>
        <p className="text-text-2 text-xs leading-relaxed">
          Trading in these markets may involve elevated risk, including low liquidity, high
          volatility, incomplete documentation, imperfect settlement or resolution criteria, and
          outcome determination by a resolution source that may be delayed, disputed or incorrect.
          Assess the risks and understand how each market works before proceeding.
        </p>
        <button
          className="flex items-start gap-2 text-left text-xs text-text-2 cursor-pointer"
          onClick={() => setChecked((c) => !c)}
          data-testid="deployer-disclaimer-check"
        >
          {checked ? (
            <IconCheckbox className="size-4 shrink-0 text-primary" />
          ) : (
            <IconSquare className="size-4 shrink-0" />
          )}
          <span>
            I have read and understood the above and accept the risks of interacting with
            permissionless markets deployed by this deployer.
          </span>
        </button>
        <Button
          disabled={!checked}
          onClick={() => acknowledgeVenue(venue)}
          className="w-full font-semibold"
          data-testid="deployer-disclaimer-confirm"
        >
          Confirm
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default DeployerDisclaimerModal
