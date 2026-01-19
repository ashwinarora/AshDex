import React from 'react'
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { LiFiBridge } from './LiFiBridge'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const BridgeModal = ({ isOpen, onClose }: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-fit p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Bridge</DialogTitle>
        </VisuallyHidden>
        <LiFiBridge />
      </DialogContent>
    </Dialog>
  )
}

export default BridgeModal
