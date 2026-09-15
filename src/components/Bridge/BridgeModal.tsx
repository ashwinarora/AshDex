import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { LiFiBridge } from './LiFiBridge'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const BridgeModal = ({ isOpen, onClose }: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-fit p-0 overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <VisuallyHidden>
          <DialogTitle>Bridge</DialogTitle>
          <DialogDescription>
            Cross-chain bridge to Hyperliquid, powered by LI.FI.
          </DialogDescription>
        </VisuallyHidden>
        <LiFiBridge />
      </DialogContent>
    </Dialog>
  )
}

export default BridgeModal
