'use client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import type { ResolvedOutcome } from '@/utils/outcomes/types'
import CoinIcon from './CoinIcon'
import { formatUtcLabel } from '@/utils/outcomes/template'
import { venueLabel } from './outcomeFormat'

const OutcomeDetailsModal = ({
  outcome,
  open,
  onOpenChange
}: {
  outcome: ResolvedOutcome
  open: boolean
  onOpenChange: (open: boolean) => void
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      className="bg-surface-1 border-surface-3 max-w-xl max-h-[85vh] overflow-y-auto"
      data-testid="outcome-details"
    >
      <DialogHeader className="items-center">
        <CoinIcon symbol={outcome.underlying} className="size-10" />
        <DialogTitle className="text-text-1 text-center">{outcome.title}</DialogTitle>
        <DialogDescription className="text-text-3 text-xs text-center">
          Deployed by {venueLabel(outcome.venue)}
          {outcome.expiresAt ? ` · Settles ${formatUtcLabel(outcome.expiresAt)}` : ''}
          {outcome.deployerFeeScale > 0 ? ` · Deployer fee scale ${outcome.deployerFeeScale}×` : ''}
        </DialogDescription>
      </DialogHeader>
      {outcome.outcomeLabel && (
        <p className="text-sm text-text-1">
          Outcome: <span className="text-primary">{outcome.outcomeLabel}</span>
        </p>
      )}
      <div className="text-xs text-text-2 leading-relaxed whitespace-pre-line">
        {outcome.resolutionText}
      </div>
      <p className="text-[11px] text-text-3">
        Sides: {outcome.sides[0].name} ({outcome.sides[0].coin}) / {outcome.sides[1].name} (
        {outcome.sides[1].coin}) · quote {outcome.quoteToken}
      </p>
    </DialogContent>
  </Dialog>
)

export default OutcomeDetailsModal
