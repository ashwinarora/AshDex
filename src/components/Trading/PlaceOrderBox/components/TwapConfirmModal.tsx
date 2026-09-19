'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { IconCheckbox, IconSquare } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

export type TwapConfirmDetails = {
  // BUG-08: `action` is the verb only ("Buy"/"Sell"). For perps we also carry
  // `positionSide` ("Long"/"Short") and render it as a colored chip next to
  // the verb — matching Hyperliquid's own confirm-dialog visual grammar
  // rather than concatenating `"Buy / Long"`.
  action: 'Buy' | 'Sell'
  positionSide?: 'Long' | 'Short'
  displaySize: string // "0.00200 BTC"
  runtime: string // "5 minutes"
  suborderSize: string // "~0.00018 BTC"
  triggerPrice?: string
  stopLabel?: 'Max Price' | 'Min Price'
  stopPrice?: string
  // BUG-07: surface Randomize so the user sees it before signing.
  randomize: boolean
  // Parity: surface Reduce Only for perps confirm dialog too.
  reduceOnly?: boolean
  isBuy: boolean
}

type Props = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  details: TwapConfirmDetails | null
  onConfirm: (rememberSkip: boolean) => void
  // BUG-09: while a submission is in flight, disable the confirm button so a
  // second click can't fire a duplicate wire request even before the modal
  // unmounts.
  isSubmitting?: boolean
}

const TwapConfirmModal = ({ isOpen, onOpenChange, details, onConfirm, isSubmitting }: Props) => {
  const [skipNext, setSkipNext] = useState(false)

  if (!details) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-4" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Confirm Order</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Confirm TWAP order parameters before submission.
        </DialogDescription>
        <div className="flex flex-col gap-2 text-xs w-full">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Action</span>
            <span className="text-white flex items-center gap-1">
              {details.action}
              {details.positionSide && (
                <span
                  className={cn(
                    'ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
                    details.positionSide === 'Long'
                      ? 'bg-green/20 text-green'
                      : 'bg-red/20 text-red'
                  )}
                >
                  {details.positionSide}
                </span>
              )}
            </span>
          </div>
          <Row label="Total Size" value={details.displaySize} />
          <Row label="Runtime" value={details.runtime} />
          <Row label="Size per Suborder" value={details.suborderSize} />
          {details.triggerPrice && <Row label="Trigger Price" value={details.triggerPrice} />}
          {details.stopPrice && details.stopLabel && (
            <Row label={details.stopLabel} value={details.stopPrice} />
          )}
          <Row label="Randomize" value={details.randomize ? 'Yes' : 'No'} />
          {details.reduceOnly !== undefined && (
            <Row label="Reduce Only" value={details.reduceOnly ? 'Yes' : 'No'} />
          )}
        </div>
        <p className="text-white/70 text-xs text-center">
          You pay no gas. The order will be confirmed within a few seconds.
        </p>
        <div className="flex items-center justify-center">
          <Toggle
            size={'sm'}
            className="bg-white/10 text-xs"
            pressed={skipNext}
            onPressedChange={setSkipNext}
          >
            {skipNext ? <IconCheckbox className="size-3" /> : <IconSquare className="size-3" />}
            <span className="text-xs">{"Don't show this again"}</span>
          </Toggle>
        </div>
        <DialogFooter>
          <Button
            onClick={() => onConfirm(skipNext)}
            disabled={isSubmitting}
            className={cn(
              'w-full font-semibold text-white cursor-pointer',
              details.isBuy ? 'bg-green hover:bg-green/80' : 'bg-red hover:bg-red/80'
            )}
          >
            {/* BUG-08: submit button matches the "verb + optional chip" of
                the Action row above. */}
            {details.action}
            {details.positionSide && ` / ${details.positionSide}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-white/70">{label}</span>
    <span className="text-white">{value}</span>
  </div>
)

export default TwapConfirmModal
